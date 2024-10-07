interface ImageItem {
  filename: string
  temp?: boolean
}

type SearchParams = { [key: string]: string | string[] | undefined }

type IResolveParams = {
  provider: string
  data?: objectType
}
