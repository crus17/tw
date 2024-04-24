import React, { useEffect } from 'react'
import { AccountVerificationWrapper } from './GetStarted'
import AdminListItem from './AdminListItem'
import { useDispatch, useSelector } from 'react-redux'
import { api } from '../../common/api'
import { Loading, NoticeMessage } from '../../theme/ThemeStyle'

const AdminView = () => {
    const dispatch = useDispatch()

    const { loading, error, users } = useSelector(state => state.accountVerification)

    useEffect(()=>{
        dispatch(api.getUsers())
    },[])
  return (
    <>
        {error&&<NoticeMessage color='error'>{error}</NoticeMessage>}
        {users&& users.map(user => <AdminListItem key={user._id} user={user}/>)}
        <Loading value={loading}/>
    </>
  )
}



export default AdminView