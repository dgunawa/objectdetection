FROM rockylinux/rockylinux

ARG DEBIAN_FRONTEND=noninteractive

RUN yum -y install epel-release yum-utils
RUN yum-config-manager --enable epel

RUN yum -y install python3
RUN pip3 install --no-cache-dir --upgrade pip

RUN pip3 install torch torchvision  --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu
COPY requirements.txt ./requirements.txt
RUN pip3 install --no-cache-dir --no-input -r requirements.txt

COPY yolov5 ./yolov5
COPY webapp.py ./webapp.py
COPY detector_api.py ./detector_api.py
COPY yolov5n.pt ./yolov5n.pt
COPY yolov5s.pt ./yolov5s.pt

RUN yum -y install mesa-libGL

ENV API_PORT=8000
CMD gunicorn -w 1 -b 0.0.0.0:${API_PORT} webapp:app

EXPOSE ${API_PORT}
