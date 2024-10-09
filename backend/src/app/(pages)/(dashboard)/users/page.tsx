'use server'

import UserList from '@/components/UserList'

const Users = ({ searchParams }: { searchParams: SearchParams }) => {
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
    <UserList
      keyword={(searchParams['s'] || searchParams['u'] || '') as string}
      page={page}
    />
  )
}

export default Users
