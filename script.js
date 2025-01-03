// 初始化 PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

const fileInput = document.getElementById('fileInput');
const contentDisplay = document.getElementById('fileContent');

fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    contentDisplay.innerHTML = ''; // 清空显示区域

    if (file.type === 'text/plain') {
        // 处理文本文件
        const reader = new FileReader();
        reader.onload = (e) => {
            contentDisplay.textContent = e.target.result;
        };
        reader.readAsText(file);
    } else if (file.type === 'application/pdf') {
        // 处理PDF文件
        const fileReader = new FileReader();
        fileReader.onload = async function() {
            const typedarray = new Uint8Array(this.result);
            
            try {
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                
                // 遍历所有页面
                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const scale = 1.5;
                    const viewport = page.getViewport({ scale });

                    // 为每一页创建canvas
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    // 渲染PDF页面到canvas
                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport
                    };

                    await page.render(renderContext).promise;
                    contentDisplay.appendChild(canvas);
                }
            } catch (error) {
                contentDisplay.textContent = '无法加载PDF文件: ' + error.message;
            }
        };
        fileReader.readAsArrayBuffer(file);
    } else {
        contentDisplay.textContent = '不支持的文件类型';
    }
}); 