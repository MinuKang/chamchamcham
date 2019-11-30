import * as faceapi from 'face-api.js';

const MODEL_URL = '/models';

export type C3FaceMatch = NonNullable<
  ThenArg<ReturnType<typeof ChamChamCham.prototype.getDetectSingleFace>>
>;

export default class ChamChamCham {
  public readonly canvas: HTMLCanvasElement;
  public readonly context: CanvasRenderingContext2D;

  public constructor(
    public readonly input: HTMLVideoElement,
    appendedElement: HTMLElement = document.body
  ) {
    this.canvas = faceapi.createCanvasFromMedia(input);
    this.canvas.width = input.videoWidth;
    this.canvas.height = input.videoHeight;
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    appendedElement.appendChild(this.canvas);
    faceapi.matchDimensions(this.canvas, this.displaySize);
  }

  public get displaySize() {
    return {
      width: this.input.videoWidth,
      height: this.input.videoHeight,
    };
  }

  public async getDetectSingleFace() {
    const detection = await faceapi
      .detectSingleFace(this.input, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor()
      .withAgeAndGender()
      .withFaceExpressions();
    return detection && faceapi.resizeResults(detection, this.displaySize);
  }

  public async getDetectAllFace() {
    const detections = await faceapi
      .detectAllFaces(this.input, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors()
      .withAgeAndGender()
      .withFaceExpressions();
    return faceapi.resizeResults(detections, this.displaySize);
  }

  private getTwoPointDegree(point1: faceapi.Point, point2: faceapi.Point) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const rad = Math.atan2(dx, dy);
    return (rad * 180) / Math.PI;
  }

  public getMatchFacePosition(
    detection: NonNullable<
      ThenArg<ReturnType<typeof ChamChamCham.prototype.getDetectSingleFace>>
    >
  ) {
    const landmark = detection.landmarks;

    const nosePoints = landmark.getNose();
    const topNosePoint = nosePoints[0];

    // Face points
    const facePoints = landmark.getJawOutline();

    // Check face is not a center alignment
    const middleFacePoint = facePoints[Math.floor(facePoints.length / 2)];
    if (Math.abs(this.getTwoPointDegree(topNosePoint, middleFacePoint)) > 15) {
      return null;
    }

    const leftFacePoint = facePoints[0];
    const rightFacePoint = facePoints[facePoints.length - 1];

    const percentOfNosePosition = Math.abs(
      ((rightFacePoint.x - topNosePoint.x) /
        (leftFacePoint.x - rightFacePoint.x)) *
        100
    );

    return percentOfNosePosition < 33.333
      ? ('left' as const)
      : percentOfNosePosition > 66.666
      ? ('right' as const)
      : ('center' as const);
  }

  public clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public drawLandmark(
    detection: Parameters<typeof faceapi.draw.drawFaceLandmarks>[1]
  ) {
    this.clear();
    faceapi.draw.drawFaceLandmarks(this.canvas, detection);
  }

  public static async loadModel() {
    return Promise.all([
      faceapi.loadTinyFaceDetectorModel(MODEL_URL),
      faceapi.loadMtcnnModel(MODEL_URL),
      faceapi.loadSsdMobilenetv1Model(MODEL_URL),
      faceapi.loadFaceLandmarkModel(MODEL_URL),
      faceapi.loadFaceRecognitionModel(MODEL_URL),
      faceapi.loadFaceExpressionModel(MODEL_URL),
      faceapi.loadAgeGenderModel(MODEL_URL),
    ]);
  }
}
