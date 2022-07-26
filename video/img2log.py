import numpy as np
import cv2
import os

def img2log(the_out, dest = './'):
  the_out = cv2.bitwise_not(the_out)

  xm, ym = the_out.shape

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
  fx.close()
  fy.close()

  os.system('cp x.val ' + dest + ' 2>/dev/null')
  os.system('cp y.val ' + dest + ' 2>/dev/null')
