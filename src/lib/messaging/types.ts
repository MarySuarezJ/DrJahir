export const messageChannels = ["whatsapp", "correo", "sms"] as const;

export type MessageChannel = (typeof messageChannels)[number];

export type MessageStatus = "pendiente" | "enviado" | "fallido" | "parcial" | "simulado";

export type MessageRecipient = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
  municipality: string;
  profession: string;
  supportLabel: string;
  kind: string;
  birthDate: string;
};

export type DeliveryResult = {
  status: Exclude<MessageStatus, "pendiente" | "parcial">;
  provider: string;
  providerMessageId?: string;
  error?: string;
  simulated: boolean;
};
