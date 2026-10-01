import { describe, expect, it } from "vitest";
import {
  buildProviderCredentials,
  deepLXEndpointIsValid,
  credentialEditorStateAfterDeleteRequest,
  credentialFieldsForProvider,
  emptyCredentialDraft,
  endpointFieldsForProvider,
} from "./providerCredentials";

describe("provider credential payloads", () => {
  it("keeps one-key providers on the compact credential shape", () => {
    const draft = emptyCredentialDraft();
    draft.apiKey = "  sk-test  ";
    expect(buildProviderCredentials("googleGeminiLive", draft)).toEqual({
      kind: "apiKey",
      apiKey: "sk-test",
    });
  });

  it("requires every provider-specific field", () => {
    expect(credentialFieldsForProvider("azureOpenAIRealtime")).toEqual([
      "endpoint",
      "deployment",
      "transcriptionDeployment",
      "apiKey",
    ]);
    const draft = emptyCredentialDraft();
    draft.endpoint = "https://mimi.openai.azure.com";
    draft.deployment = "translate";
    draft.transcriptionDeployment = "transcribe";
    expect(buildProviderCredentials("azureOpenAIRealtime", draft)).toBeNull();
    draft.apiKey = "secret";
    expect(buildProviderCredentials("azureOpenAIRealtime", draft)).toEqual({
      kind: "azureOpenAI",
      endpoint: "https://mimi.openai.azure.com",
      deployment: "translate",
      transcriptionDeployment: "transcribe",
      apiKey: "secret",
    });
  });

  it("describes multi-field Tencent and Baidu credentials", () => {
    expect(credentialFieldsForProvider("tencentCloud")).toEqual([
      "appId",
      "secretId",
      "secretKey",
    ]);
    expect(credentialFieldsForProvider("baiduTranslate")).toEqual([
      "appId",
      "appKey",
    ]);
  });

  it("clears every write-only field before a confirmed deletion", () => {
    const draft = emptyCredentialDraft();
    draft.apiKey = "new-api-secret";
    draft.appId = "123456";
    draft.secretId = "new-secret-id";
    draft.secretKey = "new-secret-key";

    const editing = { draft, editingSavedCredential: true };
    expect(credentialEditorStateAfterDeleteRequest(editing, false)).toBe(
      editing,
    );
    expect(credentialEditorStateAfterDeleteRequest(editing, true)).toEqual({
      draft: emptyCredentialDraft(),
      editingSavedCredential: false,
    });
  });
});

it("keeps DeepLX recognition credentials separate and makes its token optional", () => {
  const draft = { ...emptyCredentialDraft(), asrApiKey: " synthetic-asr ", endpoint: " https://example.com/translate " };
  expect(credentialFieldsForProvider("deepLX")).toEqual(["asrApiKey", "endpoint", "token"]);
  expect(buildProviderCredentials("deepLX", draft)).toEqual({ kind: "deepLX", asrApiKey: "synthetic-asr", endpoint: "https://example.com/translate", token: "" });
  expect(buildProviderCredentials("deepLX", { ...draft, asrApiKey: "" })).toBeNull();
  expect(buildProviderCredentials("deepLX", { ...draft, endpoint: "" })).toBeNull();
  expect(buildProviderCredentials("deepLX", { ...draft, token: " synthetic-token " })?.kind).toBe("deepLX");
});

it("builds OpenAI-compatible credentials with optional translation URL and key", () => {
  const draft = {
    ...emptyCredentialDraft(),
    asrBaseUrl: " https://openrouter.ai/api/v1 ",
    asrApiKey: " synthetic-key ",
    asrModel: "qwen/qwen3-asr-1.7b",
    mtModel: "deepseek/deepseek-chat",
  };
  expect(credentialFieldsForProvider("openAICompatible")).toEqual(["asrBaseUrl", "asrApiKey", "asrModel", "mtModel", "mtBaseUrl", "mtApiKey"]);
  expect(endpointFieldsForProvider("openAICompatible")).toEqual(["asrBaseUrl", "mtBaseUrl"]);
  expect(buildProviderCredentials("openAICompatible", draft)).toEqual({
    kind: "openAICompatible",
    asrBaseUrl: "https://openrouter.ai/api/v1",
    asrApiKey: "synthetic-key",
    asrModel: "qwen/qwen3-asr-1.7b",
    mtBaseUrl: "",
    mtApiKey: "",
    mtModel: "deepseek/deepseek-chat",
  });
  for (const required of ["asrBaseUrl", "asrApiKey", "asrModel", "mtModel"] as const) {
    expect(buildProviderCredentials("openAICompatible", { ...draft, [required]: "" }), required).toBeNull();
  }
});

 it("rejects unsafe or invalid DeepLX endpoints before credential submission", () => {
  for (const endpoint of ["not-a-url", "bad", "http://example.com", "https://user:password@example.com", "https://example.com?token=synthetic", "https://example.com#fragment", "https://example.com?", "https://example.com#", "https://example.com\n", "https://example.com/" + "x".repeat(2048)]) {
    expect(deepLXEndpointIsValid(endpoint), endpoint).toBe(false);
  }
  for (const endpoint of ["https://example.com", "https://example.com/api/translate", " http://localhost:1188/translate ", "http://127.0.0.1:1188", "http://[::1]:1188"]) {
    expect(deepLXEndpointIsValid(endpoint), endpoint).toBe(true);
  }
});
