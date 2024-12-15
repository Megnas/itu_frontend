//Projekt ITU - Pivní Plánovač
//Autor: Dominik Václavík


interface QueryParams {
    [key: string]: string | number;
  }
  
  function formatUrl(baseUrl: string, params: QueryParams): string {
    const queryString = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join("&");
  
    return `${baseUrl}?${queryString}`;
  }

export default formatUrl;