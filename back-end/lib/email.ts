import nodemailer from "nodemailer";
import type { RuntimeConfig } from "./context.ts";

export type EmailDeliveryStatus = "sent" | "failed" | "skipped";

export type EmailDeliveryResult = {
  status: EmailDeliveryStatus;
  errorMessage: string | null;
};

type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

function buildFromAddress(runtimeConfig: RuntimeConfig) {
  const fromEmail =
    runtimeConfig.emailFrom || runtimeConfig.sendgridFromEmail;

  if (!fromEmail) {
    return null;
  }

  if (runtimeConfig.emailFromName) {
    return `${runtimeConfig.emailFromName} <${fromEmail}>`;
  }

  return fromEmail;
}

function hasSmtpConfig(runtimeConfig: RuntimeConfig) {
  return Boolean(
    runtimeConfig.smtpUser &&
      runtimeConfig.smtpPass &&
      (runtimeConfig.smtpService ||
        runtimeConfig.smtpHost),
  );
}

function resolveSmtpPassword(runtimeConfig: RuntimeConfig) {
  const password = runtimeConfig.smtpPass ?? "";
  const smtpService = (runtimeConfig.smtpService ?? "").toLowerCase();
  const smtpHost = (runtimeConfig.smtpHost ?? "").toLowerCase();
  const isGmail = smtpService === "gmail" || smtpHost.includes("gmail");

  if (isGmail) {
    return password.replace(/\s+/g, "");
  }

  return password;
}

async function sendViaSmtp(
  runtimeConfig: RuntimeConfig,
  input: SendEmailInput,
): Promise<EmailDeliveryResult> {
  if (!hasSmtpConfig(runtimeConfig)) {
    return {
      status: "skipped",
      errorMessage: "SMTP is not configured.",
    };
  }

  const from = buildFromAddress(runtimeConfig);
  if (!from) {
    return {
      status: "failed",
      errorMessage: "EMAIL_FROM is required for SMTP delivery.",
    };
  }

  try {
    const transporter = nodemailer.createTransport(
      runtimeConfig.smtpService
        ? {
            service: runtimeConfig.smtpService,
            auth: {
              user: runtimeConfig.smtpUser!,
              pass: resolveSmtpPassword(runtimeConfig),
            },
          }
        : {
            host: runtimeConfig.smtpHost!,
            port: runtimeConfig.smtpPort || 465,
            secure: runtimeConfig.smtpSecure || (runtimeConfig.smtpPort || 465) === 465,
            auth: {
              user: runtimeConfig.smtpUser!,
              pass: resolveSmtpPassword(runtimeConfig),
            },
          },
    );

    await transporter.sendMail({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });

    return {
      status: "sent",
      errorMessage: null,
    };
  } catch (error) {
    return {
      status: "failed",
      errorMessage:
        error instanceof Error ? error.message : "Unknown SMTP email error.",
    };
  }
}

async function sendViaSendGrid(
  runtimeConfig: RuntimeConfig,
  input: SendEmailInput,
): Promise<EmailDeliveryResult> {
  if (!runtimeConfig.sendgridApiKey || !runtimeConfig.sendgridFromEmail) {
    return {
      status: "skipped",
      errorMessage: "SendGrid is not configured.",
    };
  }

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${runtimeConfig.sendgridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: input.to }] }],
        from: { email: runtimeConfig.sendgridFromEmail },
        subject: input.subject,
        content: [
          { type: "text/plain", value: input.text },
          { type: "text/html", value: input.html },
        ],
      }),
    });

    if (!response.ok) {
      const responseBody = await response.text();
      return {
        status: "failed",
        errorMessage:
          responseBody || `SendGrid request failed (${response.status}).`,
      };
    }

    return {
      status: "sent",
      errorMessage: null,
    };
  } catch (error) {
    return {
      status: "failed",
      errorMessage:
        error instanceof Error
          ? error.message
          : "Unknown SendGrid email error.",
    };
  }
}

export async function sendOperationalEmail(
  runtimeConfig: RuntimeConfig,
  input: SendEmailInput,
): Promise<EmailDeliveryResult> {
  const smtpResult = await sendViaSmtp(runtimeConfig, input);
  if (smtpResult.status === "sent") {
    return smtpResult;
  }

  const sendGridResult = await sendViaSendGrid(runtimeConfig, input);
  if (sendGridResult.status === "sent") {
    return sendGridResult;
  }

  if (smtpResult.status === "failed") {
    return smtpResult;
  }

  if (sendGridResult.status === "failed") {
    return sendGridResult;
  }

  return {
    status: "skipped",
    errorMessage:
      "No SMTP or SendGrid configuration was found for email delivery.",
  };
}
