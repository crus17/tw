import React from 'react'
import styled from 'styled-components'
import { media } from '../../theme/ThemeStyle'

const HomeBackground = () => {
  return (
    <Wrapper>
        <Title>True crypto ownership. Powerful Web3 experiences</Title>
        <Subtitle>Unlock the power of your cryptocurrency assets and explore the world of Web3 with Trust.</Subtitle>
        <Image src="/../assets/background.png" alt="" />
    </Wrapper>
  )
}

const Wrapper = styled.div`
    display: none;
    padding: 20px;
    border-radius: 20px;
    max-width: 60%;
    ${media.large`
        display: block;
    `}
`
const Title = styled.h1`
    
`
const Subtitle = styled.h2`
    
`
const Image = styled.img`
    width: 100%;
`
export default HomeBackground