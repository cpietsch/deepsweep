#!/bin/python
# cleans sensor data
# christopher pietsch
import sys
from scipy.ndimage import gaussian_filter1d
import numpy as np
 
_i=sys.argv[1]
_o=sys.argv[2]
 
f = open(_i, "r")
rl=f.readlines()
 
a=[]
for l in rl:
    i = l.split(', ')[1:]
    x=float(i[0])
    y=float(i[1].rstrip('\n'))
    a.append((x, y))
 
na=np.array(a)
 
x, y = na.T
t = np.linspace(0, 1, len(x))
t2 = np.linspace(0, 1, 100)
 
x2 = np.interp(t2, t, x)
y2 = np.interp(t2, t, y)
sigma = 10
x3 = gaussian_filter1d(x2, sigma)
y3 = gaussian_filter1d(y2, sigma)
 
x4 = np.interp(t, t2, x3)
y4 = np.interp(t, t2, y3)
 
fo=open(_o, 'a')
for p in range(len(x3)):
    fo.write(str(x3[p])+", "+str(y3[p])+"\n")
   
fo.close()