import { Fragment } from 'react'
import { Route, Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'

const ProtectedRoute = ({isAdmin, component: Component, ...rest}) => {

    const user = JSON.parse(localStorage.getItem("user"));

    // eslint-disable-next-line no-unused-vars
    const { isAuthenticated, loading } = useSelector(state => state.auth)

    return (
        <Fragment>
            <Route 
            {...rest}
            render = {props => {
                if(!user?.role){
                    return <Redirect to='/login' />
                }

                if(isAdmin === true && user.role !=='admin'){
                    return <Redirect to='/' />
                }

                return <Component {...props} />
            }}
            />
        </Fragment>
    )
}

ProtectedRoute.propTypes = {
    isAdmin: PropTypes.bool,
    component: PropTypes.func
}

export default ProtectedRoute
