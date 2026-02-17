import { env } from "../env/index.js";

export class EvolutionApi {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = env.EVOLUTION_API_URL || "http://127.0.0.1:8080";
    this.apiKey = env.EVOLUTION_API_KEY || "oxyfood_secret_key_123";
  }

  async createInstance(instanceName: string) {
    try {
      const response = await fetch(`${this.baseUrl}/instance/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: this.apiKey,
        },
        body: JSON.stringify({
          instanceName: instanceName,
          token: instanceName,
          qrcode: true,
          integration: "WHATSAPP-BAILEYS",
          reject_call: true,
        }),
      });
      return await response.json();
    } catch (error) {
      return null;
    }
  }

  async connectInstance(instanceName: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/instance/connect/${instanceName}`,
        {
          method: "GET",
          headers: { apikey: this.apiKey },
        },
      );
      return await response.json();
    } catch (error) {
      return null;
    }
  }

  async deleteInstance(instanceName: string) {
    try {
      await fetch(`${this.baseUrl}/instance/delete/${instanceName}`, {
        method: "DELETE",
        headers: { apikey: this.apiKey },
      });
    } catch (error) {
      // Silencioso
    }
  }

  async sendText(instanceName: string, phone: string, text: string) {
    try {
      // Remove caracteres não numéricos do telefone (deixa apenas números)
      const cleanPhone = phone.replace(/\D/g, "");

      const response = await fetch(
        `${this.baseUrl}/message/sendText/${instanceName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: this.apiKey,
          },
          body: JSON.stringify({
            number: cleanPhone,
            options: {
              delay: 1200,
              presence: "composing",
              linkPreview: false,
            },
            textMessage: {
              text: text,
            },
          }),
        },
      );

      return await response.json();
    } catch (error) {
      console.error("❌ Erro ao enviar mensagem via Evolution:", error);
      return null;
    }
  }
}

export const evolutionApi = new EvolutionApi();
