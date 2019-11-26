import * as axios from 'axios';

const BASE_URL = process.env.BASE_URL;

function upload(formData, neighbourhood) {
    console.log(formData)
    return axios.post(`${BASE_URL}/create`, formData)
        // get data
        .then(x => x.data)
        // add url field
        .then(x => x.map(file => Object.assign({},
            file, { neighbourhood: neighbourhood })));
}

export { upload }
