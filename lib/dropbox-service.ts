import { Dropbox } from 'dropbox';

// Credenciais do Dropbox
const DROPBOX_APP_KEY = 'oqjhlyqioyqvdiy';
const DROPBOX_APP_SECRET = '8x5vidn5ia37qmd';

let dbx: Dropbox | null = null;
let accessToken: string | null = null;

/**
 * Define o token de acesso para autenticação com Dropbox
 */
export function setDropboxAccessToken(token: string): void {
  accessToken = token;
  dbx = new Dropbox({
    accessToken: token,
  });
}

/**
 * Obtém o token de acesso atual
 */
export function getDropboxAccessToken(): string | null {
  return accessToken;
}

/**
 * Faz upload de um arquivo para o Dropbox
 */
export async function uploadToDropbox(
  fileName: string,
  fileBase64: string,
  mimeType: string
): Promise<{ path: string; id: string; name: string }> {
  if (!dbx || !accessToken) {
    throw new Error('Dropbox não está autenticado. Faça login primeiro.');
  }

  // Converter base64 para Uint8Array
  const binaryString = atob(fileBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const filePath = `/anexos-lideres/${fileName}`;

  try {
    const response = await dbx.filesUpload({
      path: filePath,
      contents: bytes as any,
      mode: { '.tag': 'add' },
      autorename: true,
    });

    return {
      path: response.result.path_display || filePath,
      id: response.result.id,
      name: response.result.name,
    };
  } catch (error: any) {
    console.error('Erro ao fazer upload para Dropbox:', error);
    throw new Error(`Erro ao fazer upload: ${error.message}`);
  }
}

/**
 * Lista todos os arquivos da pasta de anexos
 */
export async function listDropboxFiles(): Promise<
  Array<{
    name: string;
    path: string;
    id: string;
    modified: string;
    size: number;
  }>
> {
  if (!dbx || !accessToken) {
    throw new Error('Dropbox não está autenticado. Faça login primeiro.');
  }

  try {
    const response = await dbx.filesListFolder({
      path: '/anexos-lideres',
    });

    return response.result.entries
      .filter((entry) => entry['.tag'] === 'file')
      .map((entry: any) => ({
        name: entry.name,
        path: entry.path_display,
        id: entry.id,
        modified: entry.server_modified,
        size: entry.size,
      }));
  } catch (error: any) {
    // Se a pasta não existe, retorna array vazio
    if (error.status === 409) {
      return [];
    }
    console.error('Erro ao listar arquivos do Dropbox:', error);
    throw new Error(`Erro ao listar arquivos: ${error.message}`);
  }
}

/**
 * Obtém um link de compartilhamento para um arquivo
 */
export async function getDropboxShareLink(filePath: string): Promise<string> {
  if (!dbx || !accessToken) {
    throw new Error('Dropbox não está autenticado. Faça login primeiro.');
  }

  try {
    const response = await dbx.sharingCreateSharedLinkWithSettings({
      path: filePath,
      settings: {
        requested_visibility: 'public',
      },
    });

    // Converter link para download direto
    return response.result.url.replace('?dl=0', '?dl=1');
  } catch (error: any) {
    // Se o link já existe, tenta obter
    if (error.status === 409) {
      const listResponse = await dbx.sharingListSharedLinks({
        path: filePath,
      });

      if (listResponse.result.links.length > 0) {
        return listResponse.result.links[0].url.replace('?dl=0', '?dl=1');
      }
    }

    console.error('Erro ao criar link de compartilhamento:', error);
    throw new Error(`Erro ao criar link: ${error.message}`);
  }
}

/**
 * Deleta um arquivo do Dropbox
 */
export async function deleteDropboxFile(filePath: string): Promise<void> {
  if (!dbx || !accessToken) {
    throw new Error('Dropbox não está autenticado. Faça login primeiro.');
  }

  try {
    await dbx.filesDeleteV2({
      path: filePath,
    });
  } catch (error: any) {
    console.error('Erro ao deletar arquivo do Dropbox:', error);
    throw new Error(`Erro ao deletar arquivo: ${error.message}`);
  }
}
