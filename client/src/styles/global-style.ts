import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
    :focus {
        outline: none;
    }
    ::-webkit-scrollbar {
        display: none;
    }
    html{
        font-size: 16px;
        -webkit-text-size-adjust: none;
        font-family: -apple-system,BlinkMacSystemFont,helvetica,Apple SD Gothic Neo,sans-serif;       
        font-display: fallback;
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
    @media (max-width:768px){
    .main_list{
        padding-top:200px;
    }
}
    
`;