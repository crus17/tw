import { Helmet } from 'react-helmet'
import PropTypes from 'prop-types'

const MetaData = ( {title} ) => {
    return (
        <Helmet>
           <title> {`Best Crypto Wallet For Web3, NFTs and DeFi | ${title}`} </title>
        </Helmet>
    )
}

MetaData.propTypes = {
    title: PropTypes.string.isRequired
}

export default MetaData
