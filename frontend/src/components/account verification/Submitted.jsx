import styled from 'styled-components'
import Logo from './Logo'
import { Button } from '../../theme/ThemeStyle'
import { useHistory, useLocation } from 'react-router-dom/cjs/react-router-dom.min'
import { AccountVerificationWrapper, Container, Main } from './GetStarted'

const Submitted = () => {
    const history = useHistory()
  return (
    <Main>
        <Logo url={location.origin} />
        <Container>
            <AccountVerificationWrapper>
                <Icon src='/../assets/verified_progress.png' alt='Unverified'/>
                <Title>Verification in progress...</Title>
                <SubTitle>Thank you for submitting your verification form. Your account verification is now in progress. This typically takes 10 minutes or less. </SubTitle>
                <SubTitle>Please refrain from attempting any withdrawals during this time to avoid any disruptions in the verification process. <br/><br/> We appreciate your patience and cooperation.</SubTitle>
                <Button onClick={()=>history.push('/login')}>Okay</Button>
            </AccountVerificationWrapper>
        </Container>
    </Main>
  )
}


const Icon = styled.img`
    max-width: 150px;
    margin-bottom: 30px;
    align-self: center;
`
const Title = styled.h1`
    font-size: 24px;
    margin: 0 0 30px;
    text-align: center;
`
const SubTitle = styled.h2`
    font-size: 18px;
    font-weight: 400;
    text-align: center;
    margin: 0;
    margin-bottom: 30px;
`
export default Submitted