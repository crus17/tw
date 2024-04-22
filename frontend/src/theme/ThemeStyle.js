import styled, { keyframes, css } from 'styled-components';
import { setAlpha } from '../common/utils';

/* Key Frames */
const spin = keyframes`
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
`

const shake = keyframes`
  0% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-5px);
  }

  50% {
    transform: translateX(5px);
  }

  75% {
    transform: translateX(-5px);
  }

  100% {
    transform: translateX(0);
  }
`
const fadeOut = keyframes`
  from {
    width: 0;
    height: 20px;
    opacity: 0;
  }
  
  to {
    width: 50px;
    height: 20px;
    opacity: 1;
  }
`

const fadeIn = keyframes`
  from {
    width: 0;
    height: 20px;
    opacity: 0;
  }

  to {
    width: 50px;
    height: 20px;
    opacity: 1;
  }
`

const slideInAnimation = keyframes`
  from {
    /* transform: translateX(100%); */
    transform: translate(100%, 50%);
  }
  to {
    /* transform: translateX(50%); */
    transform: translate(-50%, 50%);
  }
`;

const slideOutAnimation = keyframes`
  from {
    /* transform: translateX(0); */
    transform: translate(0, 50%);
  }
  to {
    /* transform: translateX(100%); */
    transform: translate(150%, 50%);

  }
`;


export const slideOut = keyframes`
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
`;

export const slideIn = keyframes`
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(-100%);
  }
`;

const breakpoints = {
  small: 576,
  medium: 768,
  large: 992,
  extraLarge: 1200,
};

// Helper function to create media query templates
export const media = Object.keys(breakpoints).reduce((acc, label) => {
  acc[label] = (...args) => css`
    @media (min-width: ${breakpoints[label]}px) {
      ${css(...args)}
    }
  `;
  return acc;
}, {});

export const StyleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-image: linear-gradient(180deg,#fff9a8 5.98%,#ffaefe 77.73%);
  color: ${({theme}) => theme.colors.text};
  min-height: 100vh;
  min-width: 100vw;
`;

export const HomeStyle = styled.div`
    background: linear-gradient(180deg, #ACCF9F, #D2E9A1);
    /* height: 100%; */
    width: 100%;
    padding: 3em 1em;
`;

export const BodyWrapper = styled.div`
    display: flex;
    flex-direction: column;
    margin: 0 5px 10px;
`

export const Fade = styled.div`
  /* animation: ${(props)=>(`${props.trans==="in"?fadeIn:fadeOut} ${props.duration?props.duration:'0.5s'} ease-in-out`)}; */
  animation: ${fadeOut} 0.5s ease-in-out;
  animation-fill-mode: forwards;
`

export const Input = styled.input`
  display: flex;
  position: relative;
  /* outline: solid ${({theme})=>theme.colors.dark3}; */
  outline: solid ${({theme, invalid})=>invalid?theme.colors.lost:theme.colors.dark3};
  background-color: ${({theme})=>theme.colors.bg};
  color: ${({theme})=>theme.colors.text};
  width: 100%;
  padding: ${({label, value})=>(value?.length>0 && label!==undefined? "20px 10px 8px":"14px 10px")};
  align-items: center;
  letter-spacing: ${({type, value}) => (type==="password"&&value.length>0?"5px":"")};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  &:focus{
    outline: none;
    background: transparent;
  }
  &:focus-within{
    background-color: ${({theme})=>theme.colors.bg};
    outline: 0;
    /* box-shadow:0 0 0 0.25rem rgba(13, 110, 253, .25); */
    box-shadow: ${({invalid})=>`0 0 0 0.25rem ${invalid?'rgba(253, 13, 13, 0.25)':'rgba(13, 110, 253, .25)'}`}; //0 0 0 0.25rem rgba(13, 110, 253, .25);
    transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
  }
`
export const Select = styled.select`
  display: flex;
  position: relative;
  outline: solid ${({theme, error})=>error?theme.colors.lost:theme.colors.dark3};
  background-color: ${({theme})=>theme.colors.bg};
  color: ${({theme})=>theme.colors.text};
  width: 100%;
  padding: ${({label, value})=>(value?.length>0 && label!==undefined? "20px 5px 8px":"14px 5px")};
  align-items: center;
  letter-spacing: ${({type, value}) => (type==="password"&&value.length>0?"5px":"")};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  &:focus{
    outline: none;
    background: transparent;
  }
  &:focus-within{
    background-color: ${({theme})=>theme.colors.bg};
    outline: 0;
    box-shadow:0 0 0 0.25rem rgba(13, 110, 253, .25);
    transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
  }
`
export const TextArea = styled.textarea`
    display: flex;
    position: relative;
    outline: solid ${({theme, invalid})=>invalid?theme.colors.lost:theme.colors.dark3};
    background-color: ${({theme})=>theme.colors.bg};
    color: ${({theme})=>theme.colors.text};
    width: 100%;
    line-height: 1.5;
    padding: ${({label, value})=>(value?.toLocaleString().length>0 && label!==undefined? "20px 10px 8px":"14px 10px")};
    align-items: center;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    &:focus{
        outline: none;
        background: transparent;
    }
    &:focus-within{
        background-color: ${({theme})=>theme.colors.bg};
        outline: 0;
        box-shadow: ${({invalid})=>`0 0 0 0.25rem ${invalid?'rgba(253, 13, 13, 0.25)':'rgba(13, 110, 253, .25)'}`}; //0 0 0 0.25rem rgba(13, 110, 253, .25);
        transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
    }
`
export const InputLabel = styled.label`
  position: absolute;
  z-index: 1;
  display: ${({value})=>(value?.length>0? "block":"none")};
  top: 5px;
  left: 10px;
  color: ${({theme})=>theme.colors.dark3};
  font-size: 10px;
`
export const InputWrapper = styled.div`
  position: relative;
  margin: 10px 0;
  animation: ${({value})=> value==="error"?shake:''} 0.5s;
  animation-iteration-count: 1;
`

export const Button = styled.button`
  position: relative;
  background-color: ${({theme, disabled})=>disabled?theme.colors.disabledBg:theme.colors.accent};
  color: ${({theme, disabled})=>disabled?theme.colors.disabledText:theme.colors.white};
  border: none;
  padding: 13px 30px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  width: 100%;
  cursor: pointer;
  border-radius: 20px;
`

export const InputButton = styled(Button)`
    position: absolute;
    right: 2px;
    bottom: 50%;
    cursor: pointer;
    z-index: 1;
    background: ${({theme, color})=>color?theme.colors[color]:''};
    padding: 0 12px;
    color: ${({theme})=>theme.colors.white};
    border-radius: ${({color})=>color?'50%':'7px'};
    transform: translateY(50%);
    height: calc(100% - 4px);
    width: fit-content;
`

export const InputIcon = styled.div`
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    right: 2px;
    bottom: 50%;
    z-index: 1;
    color: ${({theme, color})=>color?theme.colors[color]:'text'};
    padding: 0 12px;
    border-radius: 50%;
    transform: translateY(50%);
    height: calc(100% - 4px);
    width: fit-content;
`

export const FormControlWrapper = styled.div`
    position: relative;
    border-radius: 20px;
    padding: 30px 20px;
    background: ${({theme})=> theme.colors.bg};

    &::before{
        position: absolute;
        content: '';
        width: 15%;
        left: 50%;
        top: 0;
        border-radius: 10px;
        transform: translate(-50%, 5px);
        border-top: solid 3px rgba(0, 0, 0, 0.5);
    }
    &::after{
        position: absolute;
        content: '';
        width: 20%;
        left: 50%;
        bottom: 0;
        border-radius: 10px;
        transform: translate(-50%, -5px);
        border-top: solid 3px rgba(0, 0, 0, 0.5);
    }
`

export const AvatarOverlay = styled.div`
    border-radius: 50%;
    width: 40px;
    height: 40px;
    overflow: hidden;
`
export const Avatar = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover; 
`
export const NoticeMessage = styled.div`
    display: ${({value}) => value?'block':'none'};
    color: ${({theme, value})=> value==="error"?theme.colors.lost:theme.colors.won};
    text-align: center;
    padding: 10px;
    width: 100%;
    border-radius: 10px;
    border: solid 1px;
    margin: 10px;
`

export const BannerNotice = styled.div`
    padding: 5px;
    color: ${({theme})=>theme.colors.text};
    background: ${({theme, color})=>setAlpha(theme.colors[color], 0.15)};
    border-left: 4px solid ${({theme, color})=>theme.colors[color]};
    border-right: 4px solid ${({theme, color})=>theme.colors[color]};
    border-radius: 5px;
    width: 100%;
    text-align: center;
    margin: 10px 0;
    line-height: 1.35;
`

/* Spinner */
export const Loading = styled.div`
  display: ${({value})=>value?'':'none'};
  /* position: relative; */
  /* color: transparent !important; */
  &::after{
    position: absolute;
    content: '';
    display: flex;
    border: 3px solid rgba(52, 152, 219, 0.5);
    /* border: 3px solid rgba(255, 255, 255, 0.8); */
    border-top-color: #3498db;
    border-radius: 50%;
    aspect-ratio: 1/1;
    width: auto;
    height: 50%;
    max-height: 35px;
    transition: .3s ease-in-out;
    animation: ${spin} 1s linear infinite;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  &::before{
    position: absolute;
    content: '${({value})=>value==true?'':value}';
    font-size: 12px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, calc(100% + 10px));
  }
`

export const Shake = styled.div`
  animation: ${({value})=> value==="animate"?shake:''} 0.5s;
  animation-iteration-count: 1;
`

export const ToastContainer = styled.div`
  display: ${({value})=>value.display};
  position: fixed;
  top: 5%;
  left: 50%;
  max-width: 90%;
  width: max-content;
  padding: 15px;
  z-index: 10;
  background-color: ${({value, theme})=> theme.colors[value.type]}; /* Green background color */
  color: ${({theme})=> theme.colors.white};
  border-radius: 20px;
  transform: translate(-50%, 50%);
  animation: ${({ value }) => (value.animate==='in' ? slideInAnimation : slideOutAnimation)} 0.5s ease-in-out;

  /* Optional: Add more styling to fit your design */
`;

export const SubtleLabel = styled.p`
    margin: 3px 0;
    font-size: 12px;
    color: ${({value, theme})=>theme.colors[value]};
`
