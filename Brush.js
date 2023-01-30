function Brush()
{
	this.x = window.innerWidth/2;
	this.y = window.innerHeight/2;
	this.autoBrush = false;
	this.isDown = false;

	var vx = 0;
	var vy = 0;
	var mx = 0;
	var my = 0;
	var mouseIsDown = false;

	this.update = function()
	{
		if (this.autoBrush)
		{
			if (!mouseIsDown)
			{
				vx += (Math.random() * 2 - 1) * 1.0;
  				vy += (Math.random() * 2 - 1) * 1.0;

  				vx *= 0.99;
  				vy *= 0.99;

  				mx += vx;
  				my += vy;

  				if (mx > window.innerWidth) mx = 0;
				if (mx < 0) mx = window.innerWidth;

				if (my > window.innerHeight) my = 0;
				if (my < 0) my = window.innerHeight;
			}

			this.isDown = 1;
		}
		else
		{
			if (mouseIsDown) this.isDown = 1;
			else this.isDown = 0;
		}

		this.x = mx / scale + (window.innerWidth/2/scale * (scale - 1.0));
		this.y = my / scale + (window.innerHeight/2/scale * (scale - 1.0));
	}

	window.addEventListener('mousedown', function() 
	{
	    mouseIsDown = true;
	    vx = 0;
	    vy = 0;
	    mx = event.clientX;
		my = window.innerHeight - event.clientY;
	});

	window.addEventListener('mouseup', function() 
	{
	    mouseIsDown = false;
	});

	window.addEventListener('mousemove', function() 
	{
		if (mouseIsDown)
		{
			mx = event.clientX;
			my = window.innerHeight - event.clientY;
		}
	    
	});


}