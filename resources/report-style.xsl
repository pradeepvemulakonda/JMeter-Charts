<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
<xsl:output method="text" indent="yes" encoding="UTF-8" doctype-public="-//W3C//DTD HTML 4.01 Transitional//EN" />

<!-- match the testResults and call the template build-json-->
<xsl:template match="testResults">
	   {
	   		"name":"resultJson",
	   		"jsondata":[
	   			<xsl:call-template name="build-json" />
	   		]
	   }
</xsl:template>

<xsl:template name="build-json">
	<xsl:for-each select="/testResults/*[not(@lb = preceding::*/@lb)]">
		<!--Setup some variable to be used in creating the chart data-->

			<xsl:variable name="label" select="@lb" />
			<xsl:variable name="count" select="count(../*[@lb = current()/@lb])" />
			<xsl:variable name="failureCount" select="count(../*[@lb = current()/@lb][attribute::s='false'])" />
			<xsl:variable name="successCount" select="count(../*[@lb = current()/@lb][attribute::s='true'])" />
			<xsl:variable name="successPercent" select="($successCount div $count) * 100" />
			<xsl:variable name="totalTime" select="round(sum(../*[@lb = current()/@lb]/@t))" />
			<xsl:variable name="averageTime" select="round($totalTime div $count)" />
			<xsl:variable name="avgActiveThreads" select="sum(../*[@lb = current()/@lb]/@ng) div $count" />
			{
				"threadgroup": {
					"name": "<xsl:value-of select="$label"/>",
					"averageTime": <xsl:value-of select="$averageTime"/>,
					"count": <xsl:value-of select="$count"/>,
					"totalTime": <xsl:value-of select="$totalTime"/>,
					"successCount": "<xsl:value-of select="$successCount"/>",
					"failureCount": "<xsl:value-of select="$failureCount"/>",
					"totalCount": "<xsl:value-of select="$count"/>",
					"successPercentage": "<xsl:value-of select="$successPercent"/>",
					"averageActiveThreads": "<xsl:value-of select="round($avgActiveThreads)"/>",
					"samples": [
					<!--For each thread group collect data-->
					<xsl:for-each select="../*[@lb = $label and @tn != $label]">
						{
							"threadName": "<xsl:value-of select="@tn" />",
							"elapsedTime":  "<xsl:value-of select="@t" />",
							"noOfBytes": "<xsl:value-of select="@by" />",
							"success": "<xsl:value-of select="@s" />",
							"activeThreads": "<xsl:value-of select="@ng" />",
							"timestamp": "<xsl:value-of select="@ts" />"
						}<xsl:if test="not(position()=last())">,</xsl:if>
			        </xsl:for-each>
			        ]
			    }
			}<xsl:if test="not(position()=last())">,</xsl:if>
	</xsl:for-each>
</xsl:template>
</xsl:stylesheet>