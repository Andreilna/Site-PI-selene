export const extractData = (response) => {
  return response?.data?.data || [];
};

export const extractArrayData = (response) => {
  const data = extractData(response);

  if (!Array.isArray(data)) {
    console.warn('Formato inesperado:', response?.data);
    return [];
  }

  return data;
};
