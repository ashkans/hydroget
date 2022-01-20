from pathlib import Path

def pdf(name):
    f_pdf = Path("./static_files/ashkan_shokri_cv.pdf")
    print(f_pdf.absolute())
    with open(f_pdf, "rb") as f:
        return f.read()    

def octet(name):
    f_pdf = Path(f"./static_files/{name}")
    print(f_pdf.absolute())
    with open(f_pdf, "rb") as f:
        return f.read(), 200, {'Content-Disposition': 'attachment; filename="name.zip"'}