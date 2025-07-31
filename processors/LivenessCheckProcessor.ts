import { NativeEventEmitter, NativeModules } from 'react-native';
import FaceTecConfig from '../FaceTecConfig';

const { FaceTecSDKModule } = NativeModules;
const nativeEmitter = new NativeEventEmitter(FaceTecSDKModule);

class LivenessCheckProcessor {
  private sessionToken: string;
  private onComplete: (result: { success: boolean; message: string }) => void;

  constructor(sessionToken: string, onComplete: (result: { success: boolean; message: string }) => void) {
    this.sessionToken = sessionToken;
    this.onComplete = onComplete;

    this.handleSessionDataToProcess = this.handleSessionDataToProcess.bind(this);
    nativeEmitter.addListener('onProcessSession', this.handleSessionDataToProcess);
  }

  async handleSessionDataToProcess(params: {
    status: string;
    lowQualityAuditTrailCompressedBase64: string;
    auditTrailCompressedBase64: string;
    faceScanBase64: string;
    sessionId: string;
    ftUserAgentString: string;
  }) {
    const {
      status,
      lowQualityAuditTrailCompressedBase64,
      auditTrailCompressedBase64,
      faceScanBase64,
      sessionId,
      ftUserAgentString,
    } = params;

    if (status !== 'sessionCompletedSuccessfully') {
      FaceTecSDKModule.cancelFaceScan();
      this.onComplete({
        success: false,
        message: 'La sesión no se completó correctamente.',
      });
      return;
    }

    const parameters = {
      faceScan: faceScanBase64,
      auditTrailImage: auditTrailCompressedBase64,
      lowQualityAuditTrailImage: lowQualityAuditTrailCompressedBase64,
      sessionId: sessionId,
    };

    try {
      const response = await fetch(`${FaceTecConfig.baseURL}/liveness-3d`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Key': FaceTecConfig.deviceKeyIdentifier,
          'User-Agent': ftUserAgentString,
          'X-User-Agent': ftUserAgentString,
        },
        body: JSON.stringify(parameters),
      });

      const responseJSON = await response.json();

      if (responseJSON.error || !responseJSON.wasProcessed) {
        FaceTecSDKModule.cancelFaceScan();
        this.onComplete({
          success: false,
          message: responseJSON.errorMessage || 'Error procesando el escaneo facial.',
        });
        return;
      }

      if (responseJSON.scanResultBlob) {
        FaceTecSDKModule.onScanResultBlobReceived(responseJSON.scanResultBlob);
        this.onComplete({
          success: true,
          message: 'Verificación completada exitosamente.',
        });
      } else {
        FaceTecSDKModule.cancelFaceScan();
        this.onComplete({
          success: false,
          message: 'Respuesta inesperada del servidor.',
        });
      }
    } catch (error) {
      console.error('Error en la solicitud al servidor:', error);
      FaceTecSDKModule.cancelFaceScan();
      this.onComplete({
        success: false,
        message: 'Error de red al procesar el escaneo.',
      });
    }
  }
}

export default LivenessCheckProcessor;
