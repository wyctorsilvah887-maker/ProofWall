'use server';

/**
 * @fileOverview Server Actions para integração com Google Maps API.
 * Atualizado para usar a Places API (New) v1 para maior precisão.
 */

export async function searchGooglePlaces(query: string, city: string, state: string) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn("Atenção: GOOGLE_MAPS_API_KEY não encontrada no servidor. Usando modo de simulação.");
    return [
      { 
        name: `${query}`, 
        address: `Exemplo: Rua das Flores, 123 - ${city || 'Cidade'}, ${state || 'UF'}`, 
        place_id: "ChIJN1t_tDeuEmsRUsoyG83frY4",
        isMock: true 
      }
    ];
  }

  try {
    // Tenta primeiro uma busca refinada por localização
    let textQuery = query;
    if (city && state) {
      textQuery = `${query} em ${city} ${state}`;
    } else if (city) {
      textQuery = `${query} em ${city}`;
    }

    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress',
      },
      body: JSON.stringify({
        textQuery: textQuery,
        languageCode: 'pt-BR',
      }),
      next: { revalidate: 0 } // Desativa cache para garantir resultados frescos durante a config
    });

    const data = await response.json();

    // Se a busca refinada falhar, tenta uma busca bruta apenas pelo nome
    if ((!data.places || data.places.length === 0) && textQuery !== query) {
      const fallbackRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress',
        },
        body: JSON.stringify({
          textQuery: query,
          languageCode: 'pt-BR',
        }),
      });
      const fallbackData = await fallbackRes.json();
      return (fallbackData.places || []).map((p: any) => ({
        name: p.displayName?.text || 'Nome não disponível',
        address: p.formattedAddress,
        place_id: p.id,
        isMock: false
      }));
    }

    return (data.places || []).map((p: any) => ({
      name: p.displayName?.text || 'Nome não disponível',
      address: p.formattedAddress,
      place_id: p.id,
      isMock: false
    }));
  } catch (err) {
    console.error("Falha crítica na busca do Google Places:", err);
    return [];
  }
}
