import urllib.request

url = "https://www.vizugy.hu/?mapModule=OpGrafikon&AllomasVOA=164962AF-97AB-11D4-BB62-00508BA24287&mapData=Idosor"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        content = response.read().decode('utf-8')
        with open("vizugy_dump.html", "w", encoding="utf-8") as f:
            f.write(content)
    print("Successfully fetched and saved to vizugy_dump.html")
except Exception as e:
    print(f"Error: {e}")
