import langextract as lx
import textwrap
import _utils.communicate as c
import _utils.util as u
from crawler.music.spotify.main import get_revelation_json
import requests
import json
import os
def convert_notes_to_json():
    c.set_http_proxy_ssl()
    # 1. Define the prompt and extraction rules
    prompt = textwrap.dedent(
        """\
            按出现顺序提取JSON数据。
        提取时使用确切文本。不要意译或重叠实体。
        不要添加没有的属性。"""
    )


    # The input text to be processed
    input_text = u.read_any_file("public/notes.txt", is_str=True)
    txt = """
    心理：
    回归P62。P74
    投射，童年  p59
    """
    # input_text = f"""
    # 心理：
    # 投射，童年  p59
    # 婴儿万能，p61，P63.
    # 回归P62。P74
    # 防御机制P67。239
    # 科学：
    # 牛一，p61
    # 地圆说，63
    # """
    # 2. Provide a high-quality example to guide the model
    examples = [
        lx.data.ExampleData(
            text=txt,
            extractions=[
                lx.data.Extraction(
                    extraction_class="类别",
                    extraction_text="心理",
                    attributes={"term": "回归", "pages": [62,74]}
                ),
                lx.data.Extraction(
                    extraction_class="类别",
                    extraction_text="心理",
                    attributes={"term": "投射", "pages": [59]}
                ),
                lx.data.Extraction(
                    extraction_class="类别",
                    extraction_text="心理",
                    attributes={"term": "童年", "pages": [59]}
                ),
            ],
        )
    ]
    # Run the extraction
    result = lx.extract(
        text_or_documents=input_text,
        prompt_description=prompt,
        examples=examples,
        model_id="gemini-2.5-flash",
        extraction_passes=3,    # Improves recall through multiple passes
        max_workers=20,         # Parallel processing for speed
        max_char_buffer=1000,    # Smaller contexts for better accuracy
        api_key="AIzaSyC1Obb5enW1GVph2Kzhx0-VCUcsFam0aUI",
    )
    # 2. 提取核心数据（extractions列表）
    extracted_data = result.extractions

    # 3. 转换为JSON格式（手动构造字典列表）
    json_data = {}
    for extraction in extracted_data:
        class_name = extraction.extraction_text
        if class_name not in json_data:
            json_data[class_name] = []
        json_item = extraction.attributes
        json_data[class_name].append(json_item)
    u.save_json(json_data, "public/extraction_results.json", )
    # save_data(result, "extraction_results.json", "public")


# Save the results to a JSONL file
def save_data(data, output_name, output_dir):
    lx.io.save_annotated_documents(
        [data], output_name=output_name, output_dir=output_dir
    )

    # Generate the visualization from the file
    html_content = lx.visualize(f"{output_dir}/extraction_results.json")
    with open(f"{output_dir}/visualization.html", "w") as f:
        if hasattr(html_content, "data"):
            f.write(html_content.data)  # For Jupyter/Colab
        else:
            f.write(html_content)

def fetch_fanqie_novel_data():
    """
    获取config.ts中指定的番茄小说API数据并保存为JSON文件
    添加了对非UTF-8字符和JSON解析错误的健壮处理
    """
    # https://fanqienovel.com/reader/7385115266218200126?enter_from=reader
    url = 'https://fanqienovel.com/api/reader/directory/detail?bookId=7385115176627866648&a_bogus=DXlmfO2/Msm1XfvAPXkz99JmOK60YWRqgZEzHs3jXzwp'
    print(f"正在获取数据: {url}")
    data=c.request_json(url,is_pc=False)
    chapterData = data['data']['chapterListWithVolume'][0]
    u.save_json(chapterData, "public/chapterPage.json", )
    return chapterData

if __name__ == "__main__":
    # novel_data = fetch_fanqie_novel_data()
    name = "buddha"
    address = f"/Users/dickphilipp/Documents/revelation/public/{name}"
    get_revelation_json(address)
    # convert_notes_to_json()
    # 获取番茄小说数据
    breakpoint()
    ...
