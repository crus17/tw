import React from 'react'
import styled from 'styled-components'
import { media } from '../../theme/ThemeStyle'

const Logo = () => {
  const gotoHome = ()=>{
    window.location.href = 'https://trustwallet.com/'
  }
  return (
    <Wrapper onClick={gotoHome}>
        <img src="/../assets/logo.png" alt="Trust Wallet" />
        Trust
    </Wrapper>
  )
}

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    height: 40px;
    font-size: 32px;
    font-weight: 700;
    cursor: pointer;
    margin-bottom: 20px;
    color: ${({theme})=>theme.colors.primary};
    ${media.large`
      margin-bottom: 0;
    `}
    & img{
        height: 100%;
    }

`
export default Logo