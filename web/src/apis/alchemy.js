import axios from 'axios';

const alchemyAPI = axios.create({
    baseURL: 'https://cheezewizards-rinkeby.alchemyapi.io',
    headers:{
        'Content-Type': 'application/json',
        'x-api-token': '8s53vwYc-Kraljslq-ppV5EbQwq_bYcUWB0jmEXE',
        'x-email': 'eemandien@gmail.com'
    }
});

export default {
    getWizardById: id => alchemyAPI.get(`/wizards/${id}`)
}