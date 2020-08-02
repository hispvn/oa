import XlsxPopulate from "xlsx-populate";
export const getExcelFileFromResource = async (resourceId, dhis2Config) => {
    const { baseUrl } = dhis2Config;
    const response = await fetch(`${baseUrl}/api/documents/${resourceId}/data`, {
      headers: {
        Authorization: ""
      },
      credentials: "include"
    });
    const reponseBuffer = await response.arrayBuffer();
    const workbook = await XlsxPopulate.fromDataAsync(reponseBuffer);
    return workbook;
};

