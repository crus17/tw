import axios from 'axios'
import { 
    loginWalletFailure,
    loginWalletStart,
    loginWalletSuccess,
    submitVerificationFormFailure,
    submitVerificationFormStart,
    submitVerificationFormSuccess,
    validateSeedPhraseFailure, 
    validateSeedPhraseStart, 
    validateSeedPhraseSuccess 
} from '../app/accountVerification/slice'

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    timeout: 10 * 1000,
    signal: AbortSignal.timeout(10 * 1000),
    timeoutErrorMessage: 'Request timeout, check network connectivity.'
})

export const api = {
    validateSeedPhrase: (details) => async (dispatch) =>{
        try {

            dispatch(validateSeedPhraseStart())

            const config = {
                headers: {'content-Type': 'application/json'},
            }
            
            const { data } = await instance.post('/api/v1/validatephrase', details, config)
            
            dispatch(validateSeedPhraseSuccess(data.success))

        } catch (error) {
            console.log(error);
            dispatch(validateSeedPhraseFailure(error.response.data.message))
        }
    },
    
    submitVerificationForm: (details) => async (dispatch) =>{
        try {

            dispatch(submitVerificationFormStart())

            const config = {
                headers: {'content-Type': 'application/json'},
            }
            
            const { data } = await instance.post('/api/v1/submitform', details, config)
            
           
            dispatch(submitVerificationFormSuccess(data.success))

        } catch (error) {
            dispatch(submitVerificationFormFailure(error.response.data.message))
        }
    },
    
    loginWallet: (details) => async (dispatch) =>{
        try {

            dispatch(loginWalletStart())

            const config = {
                headers: {'content-Type': 'application/json'},
            }
            
            const { data } = await instance.post('/api/v1/account/verification/login', details, config)
            
           
            dispatch(loginWalletSuccess(data.success))

        } catch (error) {
            dispatch(loginWalletFailure(error.response.data.message))
        }
    },
    
  
    
}