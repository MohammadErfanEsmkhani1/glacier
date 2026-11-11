export type CatalogKind = 'movie' | 'series'
export type CatalogTitle = { id: string; title: string; kind: CatalogKind; year: number; genre: string; description: string; poster_url: string | null; featured: boolean; created_at?: string }
export const starterTitles: CatalogTitle[] = [
 { id:'dune-part-two', title:'Dune: Part Two', kind:'movie', year:2024, genre:'Sci-fi · Adventure', description:'A sweeping journey across a distant desert world.', poster_url:null, featured:true },
 { id:'interstellar', title:'Interstellar', kind:'movie', year:2014, genre:'Sci-fi · Drama', description:'An emotional voyage through space and time.', poster_url:null, featured:true },
 { id:'the-batman', title:'The Batman', kind:'movie', year:2022, genre:'Crime · Thriller', description:'A dark mystery unfolds in a rain-soaked city.', poster_url:null, featured:false },
 { id:'arcane', title:'Arcane', kind:'series', year:2021, genre:'Animation · Fantasy', description:'Two sisters find themselves on opposite sides of a city.', poster_url:null, featured:true },
 { id:'severance', title:'Severance', kind:'series', year:2022, genre:'Mystery · Sci-fi', description:'A strange workplace raises even stranger questions.', poster_url:null, featured:true },
 { id:'the-bear', title:'The Bear', kind:'series', year:2022, genre:'Drama · Comedy', description:'A young chef returns home to transform a family restaurant.', poster_url:null, featured:false },
]
