document.getElementById('predict-button').addEventListener('click', async () => {
    const frontImage = document.getElementById('front-image').files[0];
    const backImage = document.getElementById('back-image').files[0];
    const tenSearch = document.getElementById('ten-search').checked;
    const allSearch = document.getElementById('all-search').checked;

    if (!frontImage || !backImage) {
        alert('앞면과 뒷면 사진을 모두 업로드해주세요.');
        return;
    }

    const formData = new FormData();
    formData.append('files', frontImage);
    formData.append('files', backImage);

    const params = new URLSearchParams();
    params.append('all', allSearch);

    try {
        const response = await fetch(`http://backend:8080/image_query/?${params.toString()}`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        displayResults(result, tenSearch ? 10 : 5);
    } catch (error) {
        console.error('Error:', error);
        alert('예측 중 오류가 발생했습니다.');
    }
});

function displayResults(data, maxResults) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (data.items[0].valid) {
        const items = data.items.slice(0, maxResults);
        items.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('result-item');

            const name = document.createElement('p');
            name.textContent = `${index + 1}. ${item.name}`;

            const img = document.createElement('img');
            img.src = item.image_url;
            img.alt = item.name;

            const score = document.createElement('p');
            score.textContent = `유사도: ${item.score}`;

            itemDiv.appendChild(name);
            itemDiv.appendChild(img);
            itemDiv.appendChild(score);
            resultsDiv.appendChild(itemDiv);
        });
    } else {
        let errorMsg = '';
        if (data.msg1 === 0) errorMsg += '앞면 사진에서 알약이 검출되지 않았습니다.\n';
        if (data.msg1 === 2) errorMsg += '앞면 사진에서 2개 이상의 알약이 검출되었습니다.\n';
        if (data.msg2 === 0) errorMsg += '뒷면 사진에서 알약이 검출되지 않았습니다.\n';
        if (data.msg2 === 2) errorMsg += '뒷면 사진에서 2개 이상의 알약이 검출되었습니다.\n';
        resultsDiv.textContent = errorMsg;
    }
}
