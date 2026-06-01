import PocketBase from 'pocketbase'

const PB_URL = import.meta.env.VITE_PB_URL as string

export const pb = new PocketBase(PB_URL)
