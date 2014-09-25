# fekitGUI

通过node + webkit为fekit构建一个ui操作界面 - 现在可以在windows里面安静的运行

使用须知：

	我的电脑用于切换磁盘

	通过浏览磁盘、目录过滤突出显示fekit项目

现在比较好的支持：

	fekit server 
	
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
