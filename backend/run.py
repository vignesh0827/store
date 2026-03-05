import uvicorn

if __name__ == "__main__":
    # app/main.py-ல் உள்ள 'app' என்ற FastAPI instance-ஐ இயக்குகிறது
    # போர்ட் எண் 8000-ல் இயங்கும்
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
