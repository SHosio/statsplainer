let BACKEND_PORT = 5050;

export const apiCallPost = (path, pdfFile) => {
    const formData = new FormData();
    formData.append("file", pdfFile);

    return new Promise((resolve, reject) => {
        fetch(`http://localhost:${BACKEND_PORT}/` + path, {
            method: 'POST',
            credentials: 'include',
            body: formData
        })
        .then(response => {
            if (response.status !== 200) {
            reject('POST Promise reject error');
            }
            return response.json()
        })
        .then(data => {
            resolve(data);
        });
    })
};


export const apiCallGet = (path, queryString) => {
    return new Promise((resolve, reject) => {
        fetch(`http://localhost:${BACKEND_PORT}/` + path + '?' + queryString, {
            method: 'GET',
            credentials: 'include',
        }).then((response) => {
        if (response.status !== 200) {
            reject('GET Promise reject error');
        }
            return response.blob()
        }).then((data) => {
            resolve(data);
        });
    })
};

export const apiCallPostText = (path, body) => {
    return new Promise((resolve, reject) => {
        fetch(`http://localhost:${BACKEND_PORT}/` + path, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-type': 'application/json',
        },
        body: JSON.stringify(body)
        })
        .then(response => {
            if (response.status !== 200) {
            reject('POST Promise reject error');
            }
            return response.json()
        })
        .then(data => {
            resolve(data);
        });
    })
};

export const getSessionSummary = () => {
    return new Promise((resolve, reject) => {
        fetch(`http://localhost:${BACKEND_PORT}/session-summary`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-type': 'application/json',
            }
        })
        .then(response => {
            if (response.status !== 200) {
                reject('Failed to get session summary');
            }
            return response.json()
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        });
    })
};
