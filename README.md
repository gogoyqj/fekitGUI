# fekitGUI

通过node + webkit为fekit构建一个ui操作界面

使用须知：

	由于现在还没做好磁盘切换功能，因此需要将程序放到fekit项目所在的磁盘里，
	例如有：hotel_qta项目在D盘，那么将代码检出到D运行nw.exe即可

现在比较好的支持：

	fekit server - 暂时未支持自选配置
	
	fekit install 
	
	fekit config
	
	fekit min
	
	fekit pack
	

需要修改fekit才能支持：

	fekit login - 这个需要输入用户名密码，改动一下fekit，使其支持 fekit login -u -p 这种
	
	fekit logout
	
	fekit publish

快捷键支持：

	ctrl + s - 保存对fekit.config的改动
	
	ctrl + c - 终止现在运行的fekit xxx命令，已经实现windows && linux && mac os【taskill /PID pid 实现，存在一定概率误杀】
