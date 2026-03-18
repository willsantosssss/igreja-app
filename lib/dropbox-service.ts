/**
 * Serviço Dropbox usando fetch direto da API REST
 * Sem dependências nativas que causam erros de crypto
 */

const DROPBOX_API_URL = "https://www.dropboxapi.com/2";
const DROPBOX_CONTENT_URL = "https://content.dropboxapi.com/2";

interface DropboxFile {
  name: string;
  id: string;
  size: number;
  path_display: string;
  path_lower: string;
}

interface DropboxUploadResponse {
  name: string;
  id: string;
  size: number;
  path_display: string;
}

/**
 * Obter token de acesso do Dropbox
 * Nota: Em produção, isso deve ser feito via OAuth
 */
export async function getDropboxAccessToken(): Promise<string> {
  // Por enquanto, retornar um token mock
  // Em produção, implementar OAuth flow
  return process.env.DROPBOX_ACCESS_TOKEN || "";
}

/**
 * Fazer upload de arquivo para Dropbox
 */
export async function uploadToDropbox(
  fileName: string,
  fileContent: Buffer | Uint8Array,
  accessToken: string,
  folderPath: string = "/igreja-app"
): Promise<DropboxUploadResponse> {
  const path = `${folderPath}/${fileName}`;

  const response = await fetch(`${DROPBOX_CONTENT_URL}/files/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Dropbox-API-Arg": JSON.stringify({
        path,
        mode: "add",
        autorename: true,
        mute: false,
      }),
      "Content-Type": "application/octet-stream",
    },
    body: fileContent,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Dropbox upload failed: ${error}`);
  }

  return response.json();
}

/**
 * Listar arquivos em uma pasta do Dropbox
 */
export async function listDropboxFiles(
  accessToken: string,
  folderPath: string = "/igreja-app"
): Promise<DropboxFile[]> {
  const response = await fetch(`${DROPBOX_API_URL}/files/list_folder`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      path: folderPath,
      recursive: false,
      include_media_info: false,
      include_deleted: false,
      include_has_explicit_shared_members: false,
      include_mounted_folders: true,
      limit: 2000,
      shared_link: null,
      include_property_groups: null,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Dropbox list failed: ${error}`);
  }

  const data = await response.json();
  return data.entries || [];
}

/**
 * Obter link compartilhável para arquivo no Dropbox
 */
export async function getDropboxShareLink(
  filePath: string,
  accessToken: string
): Promise<string> {
  try {
    const response = await fetch(`${DROPBOX_API_URL}/sharing/create_shared_link_with_settings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: filePath,
        settings: {
          requested_visibility: "public",
          audience: "public",
          access: "viewer",
        },
      }),
    });

    if (response.status === 409) {
      // Link já existe, tentar obter
      return getExistingDropboxShareLink(filePath, accessToken);
    }

    if (!response.ok) {
      throw new Error("Failed to create share link");
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Error creating share link:", error);
    throw error;
  }
}

/**
 * Obter link compartilhável existente
 */
export async function getExistingDropboxShareLink(
  filePath: string,
  accessToken: string
): Promise<string> {
  const response = await fetch(`${DROPBOX_API_URL}/sharing/list_shared_links`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      path: filePath,
      cursor: null,
      direct_only: false,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to list share links");
  }

  const data = await response.json();
  if (data.links && data.links.length > 0) {
    return data.links[0].url;
  }

  throw new Error("No existing share link found");
}

/**
 * Deletar arquivo do Dropbox
 */
export async function deleteFromDropbox(
  filePath: string,
  accessToken: string
): Promise<void> {
  const response = await fetch(`${DROPBOX_API_URL}/files/delete_v2`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      path: filePath,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to delete file from Dropbox");
  }
}
