function FinalProject() {
  var pricefile = "price.csv";
  var companyfile = "company_info.csv";
  question1(pricefile);
  question2(companyfile);
  question3(companyfile);
  question4(companyfile);
  question5(companyfile);
}

var question1 = function (filePath) {
  var margin = { top: 80, right: 20, bottom: 100, left: 100 },
    width = 1000 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;

  var svg = d3
    .select("#q1_plot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.csv(filePath).then(function (data) {
    current_ticker = "XOM";

    dataset = data.map(function (d) {
      return { Date: d.Date, Price: d[current_ticker] };
    });

    var Xscale = d3
      .scaleBand()
      .domain(
        dataset.map(function (d) {
          return d.Date;
        })
      )
      .range([0, width])
      .padding(0.2);

    svg
      .append("g")
      .attr("class", "x_axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(Xscale))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    var ticks = d3.selectAll(".x_axis .tick text");
    ticks.each(function (d, i) {
      if (i % 5 != 0) d3.select(this).remove();
    });

    var Yscale = d3
      .scaleLinear()
      .domain([
        d3.min(dataset, function (d) {
          return +d.Price;
        }) * 0.7,
        d3.max(dataset, function (d) {
          return +d.Price;
        }) * 1.1,
      ])
      .range([height, 0]);

    svg.append("g").attr("class", "y_axis").call(d3.axisLeft(Yscale));

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("class", "y_label")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .text("Adjusted Closing Price ($)");

    svg
      .append("text")
      .attr("transform", "translate(" + width / 2 + " ," + (height + 80) + ")")
      .style("text-anchor", "middle")
      .text("Date");
    svg
      .append("text")
      .attr("class", "title")
      .attr("x", width / 2)
      .attr("y", 0 - margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "25px")
      .style("text-decoration", "underline")
      .text("Price of " + current_ticker + " over Past 5 Years");

    var line = d3
      .line()
      .x(function (d) {
        return Xscale(d.Date);
      })
      .y(function (d) {
        return Yscale(d.Price);
      });

    svg
      .append("path")
      .datum(dataset)
      .attr("class", "line")
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2);

    var brush = d3
      .brushX()
      .extent([
        [0, 0],
        [width, height],
      ])
      .on("end", updateChart);

    svg.append("g").attr("class", "brush").call(brush);

    function updateChart(event) {
      extent = event.selection;

      if (extent != null) {
        dataset2 = data.map(function (d) {
          return { Date: d.Date, Price: d[current_ticker] };
        });

        var Yscale = d3
          .scaleLinear()
          .domain([
            d3.min(dataset2, function (d) {
              return +d.Price;
            }) * 0.7,
            d3.max(dataset2, function (d) {
              return +d.Price;
            }) * 1.1,
          ])
          .range([height, 0]);

        var selectedDates = Xscale.domain().filter(function (date) {
          return extent[0] <= Xscale(date) && Xscale(date) <= extent[1];
        });

        var filteredData = dataset2.filter(function (d) {
          return selectedDates.includes(d.Date);
        });

        highest = d3.max(filteredData, function (d) {
          return +d.Price;
        });
        lowest = d3.min(filteredData, function (d) {
          return +d.Price;
        });

        highest_date = filteredData.filter(function (d) {
          return d.Price == highest;
        });

        lowest_date = filteredData.filter(function (d) {
          return d.Price == lowest;
        });

        d3.selectAll(".highest").remove();
        d3.selectAll(".lowest").remove();

        svg
          .append("circle")
          .attr("class", "highest")
          .attr("cx", Xscale(highest_date[0].Date))
          .attr("cy", Yscale(highest))
          .attr("r", 5)
          .attr("fill", "red");
        svg
          .append("circle")
          .attr("class", "lowest")
          .attr("cx", Xscale(lowest_date[0].Date))
          .attr("cy", Yscale(lowest))
          .attr("r", 5)
          .attr("fill", "green");

        svg
          .append("text")
          .attr("class", "highest")
          .attr("x", 800)
          .attr("y", 25)
          .attr("text-anchor", "middle")
          .style("font-size", "15px")
          .text(
            "Highest Price: " + Math.round(highest_date[0].Price * 100) / 100
          );

        svg
          .append("text")
          .attr("class", "lowest")
          .attr("x", 800)
          .attr("y", 40)
          .attr("text-anchor", "middle")
          .style("font-size", "15px")
          .text(
            "Lowest Price: " + Math.round(lowest_date[0].Price * 100) / 100
          );

        svg
          .append("circle")
          .attr("class", "highest")
          .attr("cx", 720)
          .attr("cy", 20)
          .attr("r", 5)
          .attr("fill", "red");

        svg

          .append("circle")
          .attr("class", "lowest")
          .attr("cx", 720)
          .attr("cy", 35)
          .attr("r", 5)
          .attr("fill", "green");
      } else {
        d3.selectAll(".highest").remove();
        d3.selectAll(".lowest").remove();
      }
    }

    var radio = d3
      .select("#radio_q1")
      .attr("name", "value")
      .on("change", function (d) {
        current_ticker = d.target.value;
        dataset = data.map(function (d) {
          return { Date: d.Date, Price: d[current_ticker] };
        });

        var Yscale = d3
          .scaleLinear()
          .range([height, 0])
          .domain([
            d3.min(dataset, function (d) {
              return +d.Price;
            }) * 0.7,

            d3.max(dataset, function (d) {
              return +d.Price;
            }) * 1.1,
          ]);

        d3.selectAll("g.y_axis")
          .transition()
          .duration(1000)
          .call(d3.axisLeft(Yscale));

        var line = d3
          .line()
          .x(function (d) {
            return Xscale(d.Date);
          })
          .y(function (d) {
            return Yscale(d.Price);
          });

        d3.selectAll("path.line")
          .datum(dataset)
          .transition()
          .duration(1000)
          .attr("d", line);

        highest = d3.max(dataset, function (d) {
          return +d.Price;
        });
        lowest = d3.min(dataset, function (d) {
          return +d.Price;
        });

        var highest_date = dataset.filter(function (d) {
          return d.Price == highest;
        });

        var lowest_date = dataset.filter(function (d) {
          return d.Price == lowest;
        });

        d3.selectAll("circle.highest").remove();
        d3.selectAll("circle.lowest").remove();
        d3.selectAll("text.highest").remove();
        d3.selectAll("text.lowest").remove();
        d3.selectAll(".brush").remove();
        var brush = d3
          .brushX()
          .extent([
            [0, 0],
            [width, height],
          ])
          .on("end", updateChart);

        svg.append("g").attr("class", "brush").call(brush);

        d3.selectAll("text.highest")
          .transition()
          .duration(1000)

          .text(
            "Highest Price: " + Math.round(highest_date[0].Price * 100) / 100
          );

        d3.selectAll("text.lowest")

          .transition()
          .duration(1000)

          .text(
            "Lowest Price: " + Math.round(lowest_date[0].Price * 100) / 100
          );

        svg
          .select(".title")
          .text("Price of " + current_ticker + " over Past 5 Years");
      });
  });
};

var question2 = function (filePath) {
  var margin = { top: 100, right: 30, bottom: 80, left: 90 },
    width = 1000 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

  var svg = d3
    .select("#q2_plot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.csv(filePath).then(function (data) {
    let yScale = d3
      .scaleBand()
      .domain(data.map((d) => d.Ticker))
      .range([0, height])
      .padding(0.1);

    let xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => +d.Market_Cap_B) + 200])
      .range([10, width]);

    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("transform", "translate(10,0)")
      .style("text-anchor", "end");
    var y = svg.append("g").call(d3.axisLeft(yScale));

    svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", xScale(0))
      .attr("y", function (d) {
        return yScale(d.Ticker);
      })
      .attr("width", function (d) {
        return xScale(d.Market_Cap_B);
      })
      .attr("height", yScale.bandwidth())
      .attr("fill", "steelblue");

    svg
      .append("text")
      .attr("class", "title_cap_rank")
      .attr("x", width / 2)
      .attr("y", 0 - margin.top / 1.5)
      .attr("text-anchor", "middle")
      .style("font-size", "25px")
      .style("text-decoration", "underline")
      .text("Market Capitalization");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Tickers");

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom / 1.3)
      .attr("text-anchor", "middle")
      .text("Market Cap (in billions)");

    var isDescending = false;
    const sortBars = function () {
      if (isDescending) {
        dataset = data.sort((a, b) => {
          return a.Market_Cap_B - b.Market_Cap_B;
        });
        isDescending = false;
        svg
          .selectAll("text.title_cap_rank")
          .text("Market Capitalization (Low to High)");
      } else {
        dataset = data.sort((a, b) => {
          return b.Market_Cap_B - a.Market_Cap_B;
        });
        isDescending = true;
        svg
          .selectAll("text.title_cap_rank")
          .text("Market Capitalization (High to Low)");
      }

      yScale.domain(dataset.map((d) => d.Ticker));
      y.transition().duration(1000).call(d3.axisLeft(yScale));

      svg
        .selectAll(".bar")
        .data(dataset)
        .join("rect")
        .transition()
        .duration(1000)
        .attr("x", xScale(0))
        .attr("y", function (d) {
          return yScale(d.Ticker);
        })
        .attr("width", function (d) {
          return xScale(d.Market_Cap_B);
        })
        .attr("height", yScale.bandwidth())
        .attr("fill", "steelblue");
    };

    d3.select("#sort_button").on("click", function () {
      sortBars();
    });
  });
};

var question3 = function (filePath) {
  var margin = { top: 100, right: 30, bottom: 80, left: 90 },
    width = 1000 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

  var svg = d3
    .select("#q3_plot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.csv(filePath).then(function (data) {
    dataset = data.map((d) => {
      return {
        Ticker: d.Ticker,
        LogReturn: d["5Y Log Return"],
        Category: d.Category,
      };
    });

    var summed_return = d3.rollup(
      dataset,
      (v) => d3.sum(v, (d) => +d.LogReturn),
      (d) => d.Category
    );
    var max_return = d3.max(summed_return, (d) => d[1]);

    var grouped = Array.from(d3.group(dataset, (d) => d.Category)).map((d) => {
      return {
        Category: d[0],
        Ticker: d[1].map((d) => d.Ticker),
        LogReturn: d[1].map((d) => d.LogReturn),
      };
    });

    for (var i = 0; i < grouped.length; i++) {
      for (var j = 0; j < grouped[i].Ticker.length; j++) {
        grouped[i][grouped[i].Ticker[j]] = +grouped[i].LogReturn[j];
        if (grouped[i].LogReturn[j] > max_return) {
          max_return = grouped[i].LogReturn[j];
        }
      }
      delete grouped[i].Ticker;
      delete grouped[i].LogReturn;
    }

    var xScale = d3
      .scaleBand()
      .domain(grouped.map((d) => d.Category))
      .range([0, width])
      .padding(0.1);

    var yScale = d3
      .scaleLinear()
      .domain([0, max_return + 0.5])
      .range([height, 0]);

    var x = svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("font-size", "12px");
    var y = svg
      .append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .attr("font-size", "12px");

    svg
      .append("text")
      .attr("class", "title_q3")
      .attr("x", width / 2)
      .attr("y", 0 - margin.top / 1.5)
      .attr("text-anchor", "middle")
      .style("font-size", "25px")
      .style("text-decoration", "underline")
      .text("Five Year Log Return by Category");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Log Return");

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom / 1.3)
      .attr("text-anchor", "middle")
      .text("Category");

    var color = d3
      .scaleOrdinal()
      .domain(dataset.map((d) => d.Ticker))
      .range([
        "#79b3f2",
        "#a7d1f7",
        "#34495e",
        "#dcdde1",
        "#f1c40f",
        "#f7dc6f",
        "#f39c12",
        "purple",
        "#c0392b",
        "brown",
        "#7f8c8d",
      ]);

    var stackedData = d3.stack().keys(dataset.map((d) => d.Ticker))(grouped);

    svg
      .append("g")
      .selectAll("g")
      .data(stackedData)
      .join("g")
      .attr("fill", (d) => color(d.key))
      .selectAll("rect")
      .data((d) => d)
      .join("rect")
      .attr("x", (d) => xScale(d.data.Category))
      .attr("y", (d) => yScale(d[1]))
      .attr("height", (d) =>
        isNaN(d[0]) || isNaN(d[1]) ? 0 : yScale(d[0]) - yScale(d[1])
      )
      .attr("width", xScale.bandwidth());

    var legend = svg

      .append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
      .selectAll("g")
      .data(color.domain().slice())
      .join("g")
      .attr("transform", (d, i) => `translate(0,${i * 30})`);

    legend
      .append("rect")
      .attr("x", width - 19)
      .attr("width", 19)
      .attr("height", 29)
      .attr("fill", color);

    legend
      .append("text")
      .attr("x", width - 24)
      .attr("y", 14)
      .attr("dy", "0.32em")
      .text((d) => d);
  });
};

var question4 = function (filePath) {
  var width = 1000;
  var height = 800;
  var margin = 20;

  var svg = d3
    .select("#q4_plot")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + margin + "," + margin + ")");

  d3.csv(filePath).then(function (data) {
    var dataset = data.map(function (d) {
      return {
        Ticker: d.Ticker,
        HQState: d.Headquarter,
      };
    });

    const projection1 = d3.geoAlbersUsa();
    const pathgeo1 = d3.geoPath().projection(projection1);

    const statesmap = d3.json("us-states.json");

    var color = d3
      .scaleOrdinal()
      .domain(dataset.map((d) => d.HQState))
      .range(["#34495e", "orange", "purple", "blue", "brown", "#c0392b"]);

    var stateSym = {
      AZ: "Arizona",
      AL: "Alabama",
      AK: "Alaska",
      AR: "Arkansas",
      CA: "California",
      CO: "Colorado",
      CT: "Connecticut",
      DC: "District of Columbia",
      DE: "Delaware",
      FL: "Florida",
      GA: "Georgia",
      HI: "Hawaii",
      ID: "Idaho",
      IL: "Illinois",
      IN: "Indiana",
      IA: "Iowa",
      KS: "Kansas",
      KY: "Kentucky",
      LA: "Louisiana",
      ME: "Maine",
      MD: "Maryland",
      MA: "Massachusetts",
      MI: "Michigan",
      MN: "Minnesota",
      MS: "Mississippi",
      MO: "Missouri",
      MT: "Montana",
      NE: "Nebraska",
      NV: "Nevada",
      NH: "New Hampshire",
      NJ: "New Jersey",
      NM: "New Mexico",
      NY: "New York",
      NC: "North Carolina",
      ND: "North Dakota",
      OH: "Ohio",
      OK: "Oklahoma",
      OR: "Oregon",
      PA: "Pennsylvania",
      RI: "Rhode Island",
      SC: "South Carolina",
      SD: "South Dakota",
      TN: "Tennessee",
      TX: "Texas",
      UT: "Utah",
      VT: "Vermont",
      VA: "Virginia",
      WA: "Washington",
      WV: "West Virginia",
      WI: "Wisconsin",
      WY: "Wyoming",
    };

    var Tooltip = d3
      .select("#q4_plot")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip");

    var mouseover = function (d) {
      Tooltip.style("opacity", 1)
        .style("left", d3.pointers(d)[0][0] + "px")
        .style("top", d3.pointers(d)[0][1] + "px");
      if (
        dataset
          .map((d) => d.HQState)
          .includes(d.srcElement.__data__.properties.name)
      ) {
        Tooltip.style(
          "background-color",
          color(d.srcElement.__data__.properties.name)
        );

        state = d.srcElement.__data__.properties.name;
        var tickers = dataset.filter((d) => d.HQState == state);
        Tooltip.html(stateSym[state] + ": <br><br>");
        for (var i = 0; i < tickers.length; i++) {
          Tooltip.html(Tooltip.html() + tickers[i].Ticker + "<br>");
        }
        Tooltip.style("color", "white");
      } else {
        Tooltip.style("background-color", "#dcdde1").style("color", "black");
        Tooltip.html(stateSym[d.srcElement.__data__.properties.name]);
      }

      d3.select(this).transition().style("opacity", 1).style("stroke-width", 2);
    };

    var mousemove = function (d) {
      Tooltip.style("left", d.pageX + 20 + "px").style(
        "top",
        d.pageY + 20 + "px"
      );
    };

    var mouseleave = function (d) {
      Tooltip.style("opacity", 0);
      d3.selectAll(".state")
        .transition()
        .style("opacity", 0.8)
        .style("stroke-width", 0.3);
    };

    statesmap.then(function (map) {
      svg
        .selectAll("path")
        .data(map.features)
        .enter()
        .append("path")
        .attr("d", pathgeo1)
        .attr("fill", function (d) {
          if (dataset.map((d) => d.HQState).includes(d.properties.name)) {
            return color(d.properties.name);
          } else {
            return "#dcdde1";
          }
        })
        .style("stroke", "black")
        .style("stroke-width", 0.3)
        .attr("class", "state")
        .style("opacity", 0.8)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);
    });
    projection1.translate([width / 2, height / 2]).scale(1000);

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 0 + margin * 2)
      .attr("text-anchor", "middle")
      .style("font-size", "25px")
      .style("text-decoration", "underline")
      .text("Headquarter State of the Companies");
  });
};

var question5 = function (filePath) {
  width = 1200;
  height = 1000;

  d3.csv(filePath).then(function (data) {
    dataset = data.map((d) => {
      return {
        Ticker: d.Ticker,
        Rel_Perf_Pct: +d.Rel_Perf_Pct,
      };
    });
    var diagramdata = {
      nodes: [{ id: 1, name: "IXIC", x: 87, y: 145, rel_perf: 0 }],
      edges: [],
    };

    for (var i = 0; i < dataset.length; i++) {
      diagramdata.nodes.push({
        id: i + 2,
        name: dataset[i].Ticker,
        x: 87,
        y: 145,
        rel_perf: dataset[i].Rel_Perf_Pct,
      });
      diagramdata.edges.push({
        source: { id: 1, name: "IXIC", x: 87, y: 145, rel_perf: 0 },
        target: {
          id: i + 2,
          name: dataset[i].Ticker,
          x: 87,
          y: 145,
          rel_perf: dataset[i].Rel_Perf_Pct,
        },
      });
    }

    diagramdata["links"] = [];
    for (var i = 0; i < diagramdata.edges.length; i++) {
      var obj = {};
      obj["source"] = diagramdata.edges[i].source.id;
      obj["target"] = diagramdata.edges[i].target.id;
      diagramdata.links.push(obj);
    }

    var force = d3
      .forceSimulation(diagramdata.nodes)
      .force("charge", d3.forceManyBody().strength(-10000))
      .force(
        "link",
        d3.forceLink(diagramdata.links).id(function (d) {
          return d.id;
        })
      )
      .force("center", d3.forceCenter(width / 2, height / 2));

    min_rel_perf = d3.min(dataset, function (d) {
      return d.Rel_Perf_Pct;
    });
    max_rel_perf = d3.max(dataset, function (d) {
      return d.Rel_Perf_Pct;
    });

    var colorScale = d3
      .scaleSequential()
      .domain([min_rel_perf, max_rel_perf])
      .interpolator(d3.interpolateRdYlGn);

    var svg = d3
      .select("#q5_plot")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    var edges = svg
      .selectAll("line")
      .data(diagramdata.links)
      .enter()
      .append("line")
      .attr("stroke", "grey");

    var nodes = svg
      .selectAll("circle")
      .data(diagramdata.nodes)
      .enter()
      .append("circle")
      .attr("fill", function (d) {
        if (d.id == 1) {
          return "lightblue";
        } else {
          return colorScale(d.rel_perf);
        }
      });

    var labels = svg
      .selectAll("text")
      .data(diagramdata.nodes)
      .enter()
      .append("text")
      .text(function (d) {
        return d.name;
      })

      .attr("fill", function (d) {
        if (d.id == 1) {
          return "Purple";
        }
      });

    force.on("tick", function () {
      edges
        .attr("x1", function (d) {
          return d.source.x;
        })
        .attr("y1", function (d) {
          return d.source.y;
        })
        .attr("x2", function (d) {
          return d.target.x;
        })
        .attr("y2", function (d) {
          return d.target.y;
        })
        .attr("stroke-width", function (d) {
          return 5;
        });

      nodes
        .attr("cx", function (d) {
          return d.x;
        })
        .attr("cy", function (d) {
          return d.y;
        })
        .attr("r", function (d) {
          if (d.name == "IXIC") {
            return 50;
          } else {
            return Math.log(Math.abs(d.rel_perf) + 1) * 10;
          }
        });

      labels
        .attr("x", function (d) {
          if (d.name == "IXIC") {
            return d.x - 40;
          } else {
            return d.x - 18;
          }
        })
        .attr("y", function (d) {
          if (d.name == "IXIC") {
            return d.y + 15;
          } else {
            return d.y + 7;
          }
        })

        .attr("font-size", function (d) {
          if (d.name == "IXIC") {
            return 40;
          } else {
            return 15;
          }
        });

      for (var i = 0; i < 11; i++) {
        svg
          .append("rect")
          .attr("x", 1000)
          .attr("y", 150 + i * 50)
          .attr("width", 20)
          .attr("height", 50)
          .style(
            "fill",
            colorScale(min_rel_perf + (max_rel_perf - min_rel_perf) * (i / 10))
          );

        segments =
          Math.round(
            (min_rel_perf + (max_rel_perf - min_rel_perf) * (i / 10)) * 100
          ) / 100;
        if (segments > 0) {
          segments = "+" + segments + "%";
        } else {
          segments = "-" + segments + "%";
        }
        svg
          .append("text")
          .attr("x", 1030)
          .attr("y", 155 + i * 50)
          .text(segments)
          .style("font-size", "13px");
      }

      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", 100)
        .attr("text-anchor", "middle")
        .style("font-size", "25px")
        .style("text-decoration", "underline")
        .text("Relative Performance to the Nasdaq Composite(IXIC)");
    });
  });
};
