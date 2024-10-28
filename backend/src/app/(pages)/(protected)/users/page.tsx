import { Suspense } from 'react'
import UserList from '@/components/UserList'
import Indicator from '@/components/Indicator'

const Users = async (props: { searchParams: Promise<SearchParams> }) => {
  const searchParams = await props.searchParams
  let page = 0
  const p = searchParams['p'] as string
  if (p) {
    const _p = Number.parseInt(p, 10)
    if (_p > 0) {
      page = _p
    } else {
      page = 1
    }
  } else {
    page = 1
  }

  return page > 0 && (
    <Suspense fallback={<Indicator />}>
      <UserList
        keyword={(searchParams['s'] || searchParams['u'] || '') as string}
        page={page}
      />
    </Suspense>
  )
}

export default Users
