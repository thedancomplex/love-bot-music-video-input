import numpy as np
import cv2
import os
# reads image 'opencv-logo.png' as grayscale
img       = cv2.imread('chat.png')
gray      = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
img       = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
hsv       = img
#hsv       = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)


#print(np.max(img))
#lower =(100, 0,0)
#upper=(150, 255, 255)

h = 44
s = 80
v = 245
d = 20

lower = np.array([h-d, s-d, v-d])
upper = np.array([h+d, s+d, v+d])

mask      = cv2.inRange(hsv, lower, upper)
kernel    = np.ones((5,5), np.uint8)
mask = cv2.dilate(mask,kernel, iterations=1)
mask = cv2.erode(mask,kernel, iterations=1)
mask = cv2.erode(mask,kernel, iterations=1)

ret, thresh  = cv2.threshold(gray,170,255,cv2.THRESH_BINARY)
#the_out = thresh + mask 
the_out = thresh
the_out = cv2.erode(the_out, kernel, iterations=1)
the_out = cv2.erode(the_out, kernel, iterations=1)
the_out = cv2.resize(the_out, (16,16))
the_out = cv2.bitwise_not(the_out)

xm, ym = the_out.shape
print(xm)
print(ym)

try:
  os.system('rm x.val')
except:
  pass

try:
  os.system('rm y.val')
except:
  pass

os.system('touch x.val')
os.system('touch y.val')
fx = open('x.val','a')
fy = open('y.val','a')

for x in range(xm):
    for y in range(ym):
        if the_out[y,x] > 0:
            xout = str(x) + " "
            yout = str(y) + " "
            fx.write(xout)
            fy.write(yout)


#the_out = mask
#the_out = thresh
#print(type(the_out))
#print(type(ret))
#print(type(gray))
os.system('cp x.val ../dist/')
os.system('cp y.val ../dist/')
fx.close()
fy.close()
