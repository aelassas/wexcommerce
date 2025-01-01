interface ImageItem {
  filename: string
  temp?: boolean
}

type SearchParams = { [key: string]: string | string[] | undefined }
